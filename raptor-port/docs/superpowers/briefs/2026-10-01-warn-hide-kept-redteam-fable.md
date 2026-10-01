# Red team — [WARN-HIDE-KEPT] plan, round 1 — Fable 5.1, 1 Oct 26

**Read:** the plan (`2026-10-01-warn-hide-kept-plan.md`) whole; the mock (`docs/mock/warn-hide.html`); the full rows of
D469, D471, D472, D475, D45, D97, D98, D99, D101, D103, D148, D168, D179, D183–D185, D187, D188, D346, D363, D56, D473;
`ui-contracts.md` §Muting a check; and the code the brief names, each claim of §2 and each step of §3 checked against
`engine/validate.ts` (the whole of `validateCore`, `faceWarn`, `versionFaceWarn`, `warnSliceOf`, `issuedWarn`,
`warnNow`, `validate`, `officialFor`, `withIssuedWeek`, `restIfPlaced`, `lgFired`), `engine/publish.ts` (`daySnap`,
`freezeWarn`, `warnSliceKey`, `warnDelta`, `dayDelta`, `dayDeltaCore`, `dayPendingItemsIn`, `itemCounts`, `diffCounts`,
`pendingKey`, `signBoundOk`, `alIssue`, `publishALDay`, `unpublishDay`, `retiredEntry`, `dayDiscardCount`),
`engine/drafts.ts loadVersionToWorkingCopy`, `engine/hooks.ts`, `engine/avail.ts`, `engine/insights.ts`, `state/view.ts`,
`state/store.ts`, `state/history.ts`, `state/sched-commit.ts`, `state/weekrows.ts`, `state/persist.ts`,
`state/dropflag.ts`, `undo/timeline.ts` (the D148 pre-check), `ui/html.ts`, `ui/board.ts`, `ui/board-html.ts`,
`ui/palette-html.ts`, `ui/interactions.ts`, `ui/pendlist.ts`, `ui/highlights.ts`, `ui/AvailWindow.tsx`, `ui/Modals.tsx`,
`ui/SchedBoard.tsx`, `ui/ALPanel.tsx`, `ui/printpdf.ts`, `ui/export.ts`, `ui/peek.ts`, `ui/drag.ts`, and the pinned tests.

**Noted before anything else:** two untracked files already sit on the branch — `src/engine/warnhide.ts` (the key and
`shownWarns`, as §3.1 describes) and `src/state/warnhide-kept.test.ts` (the boot / sign-in / undo cases of §8 step 2). The
brief says nothing is built; I reviewed the PLAN, and read those two only to confirm they match §3.1 (they do). Nothing
below depends on them.

**Not reported (D56):** hides stored by today's build under the old key shape; versions issued before `w` existed; any
reading of a row written before this build. All of that is demo data cleared before the database.

---

## Verdict: REVISE

The design is right — one key, the bundle "as shown", the raw bundle kept as the detector, the hide state frozen into
the version, the hide as its own pending axis. Five things in the plan's own text would go wrong on NEW data as written,
and one of them (F1) is the exact disagreement the published-day machinery was built to make impossible. All are
small, specific and fixable in the plan before a line is written. The three that matter most: **F1, F2, F3**.

---

## Findings

### F1 — HIGH — The hide axis reaches `dayDelta` but not `dayPendingItems`: the count and the list read 0 while the sign-offs fall and the Publish button lights

**Claim checked:** §3.4 — "`dayDelta` concatenates it, so the day's count, 'Not yet signed' / 'Not yet published', the
publish button and the sign-offs (through `pendingKey`) follow with no further change."

**Code:** `publish.ts`
- `dayShownPendCount(di)` (line 191) = `dayPendingItems(di).length` — the day head's "N pending", the ⓘ panel, the
  plan-switch message, the Amendments panel (`ALPanel.tsx:37 itemCounts(dayPendingItems(di))`) and the pending list
  (`pendlist.ts`, through `dayPendingItems`) ALL read **`dayPendingItemsIn`** (210–257), which builds its items from
  `canonicalUnits` + the two input axes + `oilDelta` + **`warnDelta` (line 256)** — it never reads `dayDelta`.
- `dayDelta` (523) = `dayDeltaCore` + `warnDelta`; it is what `dayHasChanges` (658 — the Publish button),
  `notYetSigned` (666 — the marker), `pendingKey` (1302 — the four sign-offs, D103) and `alIssue`'s stored `diff`
  (1071) read.
- `warnDelta` was wired into BOTH on purpose (256 and 523, "so no two of them can disagree" — the comment at 192–202).
  The plan wires `hideDelta` into one.

**Scenario:** Tuesday published, nothing pending. On Edit Schedule hide "Static has a long work day".
Expected (D471, D103, D99): the day head reads "1 pending", the changes window's To go out lists "Warning hidden —
Static has a long work day", the Amendments panel reads "1 change", the four sign-offs fall, Publish AL1 is offered.
Observed with the plan as written: the four fall, "Not yet signed" shows, Publish AL1 is enabled — **and the day head
reads nothing, the To go out list is empty, the Amendments panel reads 0**. Press Publish AL1: "Published AL1 · 0 items"
(`units = items.length`), with a `diff` holding one `hide` entry. The opposite disagreement the amendment core's own
comment names: "a raw count read 'nothing unpublished' beside a 'Publish AL1' button".

**Fix, step by step:**
1. `publish.ts dayPendingItemsIn`: directly after line 256 add
   `if(sc===SCHED)hideDelta(di).forEach((e:any)=>items.push({kind:'hide',addr:e.addr,jump:[],keys:[],entry:e,axis:'hide'}));`
   and widen `PendItem.axis` to include `'hide'`.
2. `dayDelta` (523): `dayDeltaCore(di).concat(warnDelta(di)).concat(hideDelta(di))`. `dayDeltaCore` untouched (the
   official pass must not be gated on an axis that reads the pass's own output — same reason as `warnDelta`).
3. `itemCounts` / `diffCounts`: add `hide:by('hide')`; leave `chg` counting it (the plan's "counted under changes") OR
   subtract it and print it — pick one and say so in the Amendments panel wording; `ALPanel.tsx:75` falls back to
   `diffCounts(a.diff)` for a record without `ukinds`.
4. `pendlist.ts pendItemWords`: `if (it.kind === 'hide') return hideWords(di, it)`; give `'hide'` a sort weight beside
   `'warn'` (lines 390–392); the group is "The day" (D346).
5. Tests: after a hide on a published day — `dayPendingItems(di).length === 1`, `dayDelta(di).length === 1`,
   `dayShownPendCount(di) === 1`, `daySigned(di) === false`, the To go out list has the row; after the unhide — all 0 and
   the four valid again (D98); `alIssue(di)` → `units === 1` and `rec.diff[0].kind === 'hide'`; `ALPanel` text reads
   "1 change".

---

### F2 — MEDIUM — The cross-week "Breaks Monday" trace has no warning in this week; §3.2's replay rule drops it whenever anything on the week is hidden

**Claim checked:** §3.2 — the maps are rebuilt "by replaying `marks` and `traces` … skipping a mark when no SHOWN
warning of that day and code names that man"; §10 says a cross-week mark "follows that week's hides only once that week
is the one on screen" (which assumes it survives).

**Code:** `validate.ts`
- Line 1383: `crewRestDay(ev[6], (NEXTMON=nextMondaySeed(CURWEEK)), null, true, null)` — the phantom Monday pass writes
  `markTrace(6, id, {di:null, dow:'Monday', …})` (560) and no warning.
- Lines 347–350: `traceRun(6, id, {di:null, dow:'Monday', n:n+1})` — the run's forward trace, no warning.
- `dayTraceHTML` 956–964 keeps `tdi==null` rows on purpose ("there is no warning index to resolve and none is
  required").
- With nothing hidden `shownOf` returns the raw bundle (identity), so this only bites once ONE warning anywhere on the
  week is hidden — then every trace is replayed and these have no day to look in.

**Scenario:** week A's Sunday has a late landing that busts next Monday's crew rest: Sunday draws the dotted ring and the
"Breaks Monday" box. Hide any unrelated warning on Wednesday. Expected: Sunday unchanged. Observed: the dotted ring and
the box vanish; unhide Wednesday and they return. Second effect: `restIfPlaced` (1753–1754) reads `traceOf(6,id)` to tell
a NEW Monday breach from one an existing leg already causes — with the trace gone the crew list strikes the man for a
breach that is not new.

**Fix:** in the trace replay of `shownOf` (and the same rebuild in `faceWarn`): a trace entry whose breach day is `null`
is always kept — `if (t.di == null) keep` for the crew-rest fields, `if (t.run && t.run.di == null) keep` for the run
fields. Write the rule in §3.2 and in §10 (as the reason the cross-week mark is left as it is). Test: on a week carrying
the seeded Sunday→Monday bust (the cross-week fixtures already in the repo), hide one warning on any day →
`WARN.trace[6]` keeps every `di:null` entry byte-for-byte; `crossDayIfPlaced` for a second seat on that Sunday answers
the same as with nothing hidden.

---

### F3 — MEDIUM — `hideDelta`'s set is too wide, and its address is an index

**Claim checked:** §3.4 — "for each warning of today's judgement of the ISSUED day (both classes), 'hidden on the working
copy' against 'hidden as issued'; each one that differs is ONE pending change (`kind:'hide'`, `addr:'hide:<di>.<n>'`,
carrying the warning's words and which way it went)".

**(a) The set.** A key stays in `WARNOFF` after its warning stops being raised (the plan: "a key that matches no
warning is inert"). Today's judgement of the ISSUED day can still raise that warning while the WORKING copy no longer
does — then the rule emits a hide entry for a warning the amendment will not carry.
Scenario: Tuesday published. Hide K = "Saint is in two seats on VL BFM at once" (1 pending — correct). Then take Saint
off the second seat (the content change is pending; the working copy no longer raises K; K stays in `WARNOFF`).
Expected: ONE pending change, the seat. Observed: TWO — the seat, and "Warning hidden — Saint is in two seats…", a line
about a warning that is not on the list; AL1 issues with `units 2` and a `hide` entry for a warning AL1's face does not
have (at issue `w.wo` keeps effective keys only, so K is not stored); after AL1 the line is simply gone. The count was
wrong by one and the record carries a change that changed nothing.
Fix: `hideDelta(di)`: `const working = new Set(rawWarn().byDay[di]?.warns.map(hideKey))` (the WORKING raw bundle —
`workingWarn()`'s raw twin, which the plan already introduces as `rawWarn()`); iterate `OFFICIAL.byDay[di].warns`;
`const k = hideKey(w); if (!working.has(k)) continue;` then compare `HOOKS.hiddenKeys().has(k)` with `w.wo.includes(k)`.
A warning only the issued judgement raises is the content / `warnDelta` axis's business; one only the working copy
raises goes out with its edit (the plan already says so).

**(b) The address.** `pendingKey` (1302–1307) serialises every `dayDelta` entry as `addr␟kind␟from␟to` and the four
sign-offs are valid only while that string holds (`signBoundOk`, 1333). An index (`<n>`) moves when the day's list
re-sorts; the words move on a rename.
Scenario: a hide pending on Tuesday; the four re-sign over it (allowed — they sign the pending comparison). A change on
Monday's draft creates a LIVE crew-rest breach on Tuesday (D184: nothing pending on Tuesday). The list re-sorts (hard
first) and the hidden long-day note moves from index 3 to 4 → `hide:1.3` becomes `hide:1.4` → `pendingKey` differs →
the four fall, the count unchanged — a false re-sign (D103 is "only a change that shows takes them down"). Words in
`from`/`to` do the same on a callsign rename, against D186 and the pinned test "a callsign renamed on a published day is
a label: nothing pending, the four stand".
Fix: `addr: 'hide:' + di + '.' + fp(k)` (publish.ts's own `fp`), `from`/`to`: `'shown'` / `'hidden'`. The words are for
the pending list only — `pendItemWords` finds them by key in today's official list (or, for a key that is only in
`w.wo`, from the stored face). Tests: `pendingKey(di)` unchanged across (i) a live warning inserted above the hidden
one, (ii) a rename of a man the hidden warning names.

---

### F4 — MEDIUM — `faceWarn` hands back the RAW official bundle whenever no published day stores `w`, and copies raw slices for draft days — View-only Sched would show a hidden warning flagged and counted

**Claim checked:** §3.4 "A draft day inside the face keeps the working set"; §5 rows 20–21 (a member's and a guest's
View-only Sched); the mock's View-only section ("members see the count without it and Static's puck plain").

**Code:** `validate.ts faceWarn` 1412–1445: `if(!fz.length)return off;` (1415) and `byDay=(off.byDay||[]).slice(),
sev={...off.sev}, …` (1418) — `off` is `OFFICIAL`, which §3.2 keeps RAW. `withOfficialWarn` (1500) points `WARN` at it
for View-only Sched's draft days (`viewDayHTML` 247–251), for the issued face's live warnings, and `displayedBundle`
(view.ts 645) resolves every tap through it.

**Scenario:** a fresh week, nothing published. The scheduler hides Tuesday's long-day note on Edit Schedule (reads 3
issues, Static plain). A member opens View-only Sched. Expected (D469 "for everyone", D475's View-only picture): 3
issues, Static plain, the fourth line struck with no ↺. Observed: 4 issues, Static ringed grey with his L chip, no
struck line; a tap opens it as a live warning. The same for a draft Wednesday on a week whose Monday is published
(the per-day copy at 1418 is raw).

**Fix:** `faceWarn`: `const base = shownOf(off, HOOKS.hiddenKeys())` first (keys carry their day, so the working set
only ever touches its own days); `if(!fz.length) return base;` and build `byDay/sev/chip/dash/trace` from `base`, not
`off`; then overlay each published day from `w` under its issued keys (frozen marks `w.shown ?? w.sev/chip/dash`; live
marks replayed from `off.marks` filtered to `LIVE_ON_FACE` and skipped by `w.wo`; its trace entries re-keyed by the
BREACH day's set, as §3.4 says — and F2's `di:null` rule). Memo: the `FACE_OF===off` test holds only because every toggle
re-validates (§3.5) — write that invariant beside the memo. Tests: (i) no published day, one hide → inside
`withOfficialWarn`, `WARN.byDay[di].warns[ix].off === true` and `sevOf(di, id) == null`; (ii) Monday published, Tuesday
draft → Tuesday follows the working set, Monday the issued keys, and a working-copy hide on Monday changes NOTHING on its
face until AL1 (D471).

---

### F5 — MEDIUM — Four mark sites decide their code AFTER the mark is written; a mis-coded mark loses its flag silently, and only when something else is hidden

**Claim checked:** §3.2 "every mark site passes the code of the warning beside it"; §8 step 1's test "every mark has its
warning (… on both demo weeks and the rule tests' fixtures)".

**Code:** `validate.ts` 731–739 (`markChip(di,e.id,'C'); markRing(…)` on 731, `dn`/`lv` computed on 732, the code chosen
on 736), 786–789 (same), 807–811 (`dn` on 808), 1130–1137 (`dn` on 1135). Three codes share one mark at each site. The
DT chip (617) has no warning of its own name — its warning is `DT_SUM` (933), raised later from the same `dturns`
predicate on the same `pers` exclusion; the TT chip at 627 belongs to `TURN`, the one at 568 to `CREW_TIGHT`.

**Why it is silent:** with nothing hidden `shownOf` is the identity. A mark coded `INPUT_FLY` beside a `DNIF_FLY` warning
keeps its flag until a scheduler hides any OTHER warning on the week — then the replay finds no shown `INPUT_FLY`
naming the man and drops a flag whose warning is still shown and counted. The demo weeks may never raise, say, a
`LEAVE_FLY` on an SC SPARE, so the identity test passes.

**Fix:** (1) hoist `const dn=…, lv=…` above the marks at the four sites (behaviour change only; the compressed style
kept); pass `dn?'DNIF_FLY':lv?'LEAVE_FLY':'INPUT_FLY'` (and the two-code form at 807/1130). (2) `markChip(di,id,'DT',
'DT_SUM')` at 617; `'TURN'` at 627. (3) The invariant test runs over FIXTURES that raise every code through every loop:
a timed Appointment against a sortie (731), a Meeting and a Duty against a desk shift (780/786), a downchit on an AVALON
seat (807), an overseas input on an SC SPARE (1130), a double turn (617/933), a same-day tight turn (627) — and asserts,
for every entry of `marks`, `byDay[di].warns.some(w => w.code === m.code && w.who.includes(m.id))`, and for every
entry of `traces` with a day, the same on `t.di`. Add `rulecheck` names for it.

---

### F6 — LOW — The renderers must read `w.off`, never `warnShown` / `WARNOFF`, or the issued face is struck by the working set

**Code:** `board.ts:470` `if (!look && !view.warnShown(w))`, `html.ts:1123–1124` `warnShown(x.w)`, `dayInfoHTML` — all
read the WORKING set (`view.ts:796`). Under `withOfficialWarn` the bundle is the face; if a renderer still asks
`warnShown`, View-only Sched strikes a line the scheduler hid on the working copy BEFORE the amendment while the puck and
the count (from the face's maps) still show it — a half state, against D471.
**Fix:** the struck class comes from `w.off` only; remove every `warnShown` read from `html.ts`, `board.ts` and the ⓘ
panel (`warnShown` may stay for the state tests). Test in `latepub.test.tsx`'s shape: hide on the working copy of a
published day → `dayIssuedHTML(di)` has no struck row and its count is unchanged until AL1; `boardWarnHTML(di, true)`
(a look) strikes by the version's own `off`, never by `WARNOFF`.

---

### F7 — LOW — `shownOf` must copy, never mutate, and `w.sev/chip/dash` must stay raw — pin it, or a hide is counted twice

**Code:** `warnSliceKey` (610–615) serialises EVERY field of each stored warning (`stableJson({...x, msg})`) and
`w.sev/chip/dash`; `HOOKS.issuedWarn` (1503) reads the `OFFICIAL.byDay` objects themselves. If the build sets
`off:true` on the raw objects (or stores the shown marks as `w.sev`), `warnNow`'s raw slice differs from the stored one
and "Warnings on this day changed" appears beside "Warning hidden". The plan says copy; nothing pins it.
**Fix:** tests — after a hide on a published day `warnDelta(di)` is `[]` and `warnSliceKey(HOOKS.warnNow(di))` equals
`storedWarnKey(snap.w)`; `shownOf(raw).byDay[di].warns[ix] !== raw.byDay[di].warns[ix]` and the raw one has no `off`.

---

### F8 — LOW — Build precisions the plan leaves implicit (each one a place the walk would otherwise find)

1. **`w.face`** is the shown slice of **OFFICIAL** (`shownOf(OFFICIAL, workingKeys)[di]`), not of `WARN` — `WARN` is the
   shown WORKING bundle, and when OFFICIAL diverges on another day the two judge this day with different neighbours.
2. **The load** (`interactions.ts` 1013–1082): `HOOKS.setDayHides(di, w.wo)` must run inside `loadVersionToWorkingCopy`
   BEFORE `view.afterSchedMutate()` (1059), so the `sched.mutate` backstop's lagging baseline captures the `sched.mutes`
   change — otherwise the hides it sets are not saved and come back after a reload (Q4's "written outside a command").
   And the "already at" short-circuit (1039: `dayCurVer===ver && nd===0`) must count a hide difference, or it says
   "Tue is already at AL1" beside "1 pending". `dayDiscardCount` (675–711) gains the hide count as §3.4 says.
3. **The red time box** (`html.ts` 1703, `board.ts` 209): under a parked-plan preview (`PV && !OFW`) keep the mark as
   today (the plan is flag-free and `WARN` is live); read the shown `FLT_NO_LEN` by key (`ff:${di}.${gi}.${li}.ld`) only
   on live paper and on a look that wears its flags.
4. **`WARN.all`** must carry the `off` copies, or §10 row 15 ("fired N×" counts a hidden one) is false and
   `dropflag.warnKey`'s `seen` set loses them; `insights.ts` (35, 40) and `Modals.tsx` (66, 71) count through
   `shownWarns`, and `dropflag.warnDelta` adds `!w.off`.
5. **Every issue hidden:** `boardWarnHTML` (453) and `dayInfoHTML` (2206) branch on `dw.length` of the RAW list — the
   quiet heading reads "No conflicts flagged for Tue ✓" / "✓ No issues" and the struck lines are still drawn under it
   (D475 call 2); the phone fold's `data-sbwtog` must still open it.
6. **Vocabulary:** `undo/describe.ts:53` 'muting a warning' → the app's words are now "hiding a warning" / "flagging a
   warning again"; the `sched.warnMute` command carries `meta:{key, words, hidden}` so the history line and the undo
   bubble say which warning without re-deriving it.
7. **The pending row's jump (D99):** carry the warning's slot `key` on the hide item so a tap takes the view to the line.
8. **D473:** `schema.ts WarnSlice` gains `wo`, `shown`, `face.warns[].off` beside the `data-schema.md` / `data-model.md`
   edits of §8 step 5; `weekrows.ts KNOWN` already lists `wo`.
9. **The other "N hidden":** the + Wave menu's "N hidden · Manage" (`WaveTplModal`, `WAVEHIDE`) is a different feature —
   the removal of `WMOPEN` / `data-wmtog` / `.wmuted-h` must not touch it (`latepub.test.tsx` 756/840 assert on
   `data-wmtog` and must be rewritten with the feature).
10. **Stale keys** stay in `WARNOFF` and the day row for ever (inert by design — a situation can return). Fine, but say
    so in `data-schema.md`'s `wo` row so the table list does not read them as an error.

---

## Explicit negatives — what I checked and found sound, per question

**Q1 — each mark knows its warning.** I walked every `markRing` / `markChip` / `markDash` / `markTrace` call in
`validateCore` (lines 339–1272). Every ring/chip/dash is written on the loop's own `di` beside an `add(…)` of the same
day whose `who` contains the marked man: crew rest (536/554), tight turn (568/573), the three clash loops (667/668,
672/673, 678/683, 731/736, 780/781, 786/788, 807/810), the in-time cut (704/705), the AVALON/BB rules (843/844,
854–856, 869/873), brief/debrief and sim brief/debrief (901–905, 919–923), long day (944/952), the run (959/960), the
matrix (1014–1016: both men marked, both in `who`), the personnel/seat rules (1024, 1025, 1030, 1034), AAR (1060–1067:
both men marked and named), OCU without IP (1085), NO_IR (1094–1099), SC currency (1109/1110), the spare rules
(1130–1137, 1166/1167, 1182–1184), SANS (1230/1233), the sim seats (1241–1243). The only mark whose warning is under a
different NAME is the DT chip (617 ↔ DT_SUM at 933) — same predicate, same exclusion, one warning naming every
double-turner, so hiding the DT_SUM line drops every DT chip, which is the right reading of "that specific item". The
TT chip is raised under two codes (TURN 627, CREW_TIGHT 568) and the per-mark code keeps them apart; two warnings of one
code on one man (two tight turns, two NO_BRIEFs, formation-level and per-aircraft NO_IR) each keep their own mark, so
both must be hidden before the flag goes — as §3.2 says. The deduplicated `add` (590–592) dedups by code|who|msg, and
every mark written before a deduped `add` refers to the identical first copy, so dedup cannot orphan a mark. Replaying
`marks` rebuilds `sev`/`chip`/`dash`/`fz`/`lv` exactly: `ring` and `flag` are maxima (order-free), `cls(code)` answers
`fz` for every code the ~26 uncoded sites gain; `trace` is rebuilt exactly if `traces` is replayed in write order
(`Object.assign` merge of CR and RUN fields on one puck, 295). The probe path (553) returns before any mark; the
phantom pass is guarded on every write but the trace (F2). FLT_NO_LEN and the OIL advisories name nobody and mark
nothing. No site marks a man its warning does not name. Holes: F2 (the two `di:null` traces), F5 (the four
three-code sites and the DT/TT codes).

**Q2 — the shown bundle and the raw one.** Readers that must stay RAW and do: `warnSliceKey` (reads
`byDay/sev/chip/dash` only — `wo`/`shown`/`face` ride inside `w` unread), `warnNow` / `SLICES` (keyed on `OFFICIAL`),
`issuedWarn` (`warnSliceOf(OFFICIAL)`), `officialSliceNow` → `faceWords` (pendlist 219–239, keys code|folded msg), the
`LKEY`/`WKEY` memos (per slice object). `officialDiverges` reads `dayDeltaCore` — `hideDelta` must sit beside
`warnDelta` outside the core (F1 step 2 keeps it there). Identity checks: `html.ts:666` `WARN===officialWarn()` (the ALL
AVAIL chip's world) stays correct — under the swap `WARN` IS the face (memoised, same object); outside it the shown copy
≠ `off`, which is the working world and replays as the working bundle either way; `dayWarnHTML:1047`
`officialWarn()!==WARN` already reads true on every published day with `w` today (the FACE is a new object), and its
`wkey` (code|who|di|prevDi) ignores `off`, so a hide never reads "new once signed" / "goes away" (§5 row 10 holds).
Memos keyed on identity (`highlights.ts:236 SELRINGS.warn!==WARN`, `FACE_OF===off`, `VFACE` per `off`) all key on an
object every `validate()` replaces, and every toggle re-validates (§3.5). `drag.ts:209` captures `WARN` and
`dropflag.flagDrop` defaults to `WARN` — both the shown bundle, consistent. The pre-drop probe's `already` (1743) reads
`WARN.byDay[d]` and FINDS a hidden warning because the `off` copy keeps its index and message — so even without
`rawWarn()` it would not read a hidden breach as new; `rawWarn()` is belt and braces, keep it. `withVersionWarn` /
`withOfficialWarn` swap and restore in `finally` as today; nothing restores the wrong one. Readers §5 missed, checked:
`weekctx.ts` / `weekstash.ts` (comments only), `state/plan.ts` (a comment), `ui/drag.ts` (the before-snapshot, above),
`LogicPage.tsx` (`lgFired`, §10), `probe-bridge.ts` (dev only), `ui/peek.ts` (draws no warnings, §10). Hole: F4
(`faceWarn`'s early return and draft-day copies).

**Q3 — the published day.** `w.wo` + `w.shown` + the shown `w.face` are enough for every face I could construct: the
current version's face = stored frozen list (reworded by `rewordSlice`, `off` kept by `{...x,msg}`) under `w.wo` +
today's live warnings under `w.wo` + `w.shown ?? w.sev/chip/dash` + live marks replayed; an older version's look =
`w.face` whole (its `off`, its shown marks, no trace — `versionFaceWarn` 1471). Orders checked and found right: hide →
publish → unhide → AL2 → look at AL1 (AL1's face keeps the hide); hide A → ORIG → unhide A, hide B → AL1 → Unpublish
AL1 (cur = ORIG: A reads "flagged again", B reads "hidden" — 2 pending, D101); Undo of a hide behind a later publish
(the publication barrier, `timeline.ts:574`, as for every change); Undo of the publish itself (the hide was already in
`WARNOFF` before it, so it reads pending again); Load onto working copy of the current version (D98 → 0 pending, given
F8 §2); a reload with a hide pending (`wo` on the day row + `w.wo` in the issuance row); a rename of a NAMED man (the
key folds him, the stored face is reworded by `w.cs`, nothing moves); a rename of an UNNAMED man whose callsign is in the
words (§10 item 4 — the face keeps the old words since `w.cs` holds named men only, so it stays hidden; the working copy
shows it; `warnDelta` reads pending because the folded messages differ — nothing silent); a live warning (CREW_REST)
hidden and issued whose words then move (it returns flagged on the face with nothing pending — exactly D183–D185's
live rule, and D469 keeps "comes back when the situation changes"); a people change that rewords a FROZEN warning
(pending by `warnDelta`; the face keeps the old line hidden until the AL; the new `w.wo` drops the stale key). A hide
is not counted twice: the stored `w.sev/chip/dash` and `warnNow` are both raw (F7 pins it). "Hidden as issued but no
longer raised" → the key is dropped at the next issue (effective keys only) and never pends. Holes: F1 (the count path),
F3 (the set and the address).

**Q4 — kept for everyone.** The boot read-back: `initStore` (893) discards `applyWeekModel`'s return, exactly as §2
says, and the baseline (927) then lacks `wo`, so the next command's row rewrite (`persist.ts loadedRows` 273 reads the
baseline's `sched.mutes`) drops the saved hides — the plan's fix (restore before `workOutLoadedWeek`'s
`resyncSchedBaseline` and before `histInit`) is the right place, and `loadWeek` (655) already does it in that order.
`resetSession` → `resetViewState('session')` → `resyncSchedBaseline()` (346): with `WARNOFF` out of the 'session' scope
the re-sync is a no-op, and `view-reset.test.ts` / `sched-routing.test.ts:73` pin the OLD behaviour and must change.
The week stash: `weekStashSnap` serialises the whole set, but the set only ever holds the loaded week's keys — cleared
by the 'week' reset after `leaveSnap` is taken (619 / 650), restored from the arriving stash (655); the one window where
the baseline momentarily carries the old week's keys under the new week's days (between `applyWeekModel`'s re-sync at
577 and the clear at 650) is closed by `workOutLoadedWeek`'s re-sync (595) before any command can run. The key's shape:
`sched-commit.ts:250` (`split('|')[0] === di`), `weekrows.ts:177` (`split('|')[0]`), `KNOWN` (48) and `dayRowJSON`
(126) all read the LEADING day and nothing else, so folding callsigns to ids inside the message breaks no writer or
reader; `splitParts` files each key in its day's row; `joinParts` (317) and `persist.ts:273` round-trip it. Undo / Redo:
`histSnap`/`histRestore` carry `wo` (60, 104); the global undo restores the `sched.mutes/<wk>#<di>` record (248–252)
and `timeline.ts outOfBandConflict` (556–562) refuses by that record's revision, naming the writer — D148 by
construction, at the day's grain (another scheduler's hide on the same DAY blocks the undo of yours, as another's
content edit on the same day blocks a content undo today — consistent, worth one sentence in §3.5). A restored record
re-validates at the transaction boundary (`schedWriteRecords`' deferred validate). Off-screen weeks: `stashRows` →
`splitParts` carries `wo`; `scheduleRows` writes it with the week's rows. Nothing I found loses, doubles or misfiles a
hide. Hole: none beyond F8 §2 (the load's write must precede the backstop).

**Q5 — the lists and the counts.** Every count and colour: `dayWarnHTML` (`dw` → `worst`, `nh`, the "N issues" line;
also the `goneW` fallback), `boardWarnHTML` (444–451), `dayInfoHTML` (`nS`), `insights.ts` (35, 40) and `Modals.tsx`
(66, 71), `AvailWindow` `flagged` / `worst` through `personWarnMsgs` (789–796), `selectPerson`'s "also flagged on"
(view.ts 595), `warnFocusMap`'s open-box lighting (1044–1047), `exemptDeskOwn` (583) and the exempt flying line's `own`
(1766–1776), the drop toast (`dropflag` 55–60) — all read `.warns` directly today and each is named in §5 with the right
letter. The person-narrowed list reads `personWarns` (avail.ts 137), which returns `off` copies too, so the narrowed
box strikes them like the full one. The "new once signed" / "goes away once signed" rows key on code|who|di|prevDi (no
`off`), so a hide is neither. The struck line's tap: `jumpToWarn` / `focusWarn` resolve by index in the displayed
bundle, which the `off` copy keeps, and `warnFocusMap`'s WFOCUS branch lights the crew regardless of `off` — "a tapped
hidden line still lights its crew" holds with no change. The board's phone fold (`SBWOPEN`, `data-sbwtog` on the
heading at 447 regardless of the count) can still open an all-hidden list. A look (`look=true`, `boardWarnHTML`;
`dayWarnHTML` under `PV`) draws no ✕/↺ already. "N hidden": `board.ts:498`, `html.ts:1138`, `view.ts WMOPEN` /
`toggleWarnMuted` (798–799), `interactions.ts:1244–1245` (`data-wmtog`), the `.wmuted-h` rule, `warnmute-week.test.ts`
("1 hidden", `data-wmtog`), `latepub.test.tsx` 756/840, `ui-contracts.md` — all named by §3.6 or §8 step 3 except the
two tests, which I add here. Holes: F6 (renderers must read `off`), F8 §5 (the all-hidden branches).

**Q6 — what the plan leaves.** Row 15 (Logic page "fired N×"): sound, provided `WARN.all` carries the `off` copies
(F8 §4). The peek's red time box: sound (`peek.ts` reads the formation alone, no bundle). The cross-week mark: the
LIMIT is sound (a trace to a week not loaded cannot follow that week's hides) but the plan's own replay rule removes
the mark altogether — F2. The unnamed-man rename: sound and never silent (Q3 above) — on a draft day the warning
simply reappears, which is the Aug 26 rule the owner kept.

**Q7 — anything else.** Roles: `sched.warnMute` is `op(T.sched,'U')` (perms.ts 274) and `canEditSched()` gates the
✕ on both surfaces; the admin in his member view (D292) reads `mayEditSched()` false and sees the struck line with no
button — consistent. A guest's View-only Sched mounts no warning list (html.ts 244–247), unchanged. The ALL AVAIL
window on the issued face replays the version's world (`withChipWorld` → `withVersionWarn` → the face) — issued keys.
Print and CSV read no warning, ring or chip (`printpdf.ts`, `export.ts` grep: none) — D471's printed half already
holds. A saved-plan switch (`draftSelect`) replaces the day and leaves `WARNOFF` alone — hides belong to the day, a key
that matches nothing is inert. The `sched.warnMute` envelope already carries one `sched.mutes` change
(`sched-routing.test.ts` row E) and `changelines.ts` has no line for that collection — the history line §3.5 adds is
new wiring, not a change to an existing one. `alIssue`'s stored `diff` is read back only by `ALPanel.tsx:75`
(`diffCounts`) and `weekrows.ts:138` (opaque), so a new `'hide'` kind breaks no reader. Performance: `shownOf` is a
replay of a few hundred marks once per validate and only while something is hidden; `hideDelta` runs inside
`publishReadPass`'s `dayDelta` memo — memoise the day's `hideKey`s per `OFFICIAL` like `SLICES` and it costs nothing
measurable. No ruling contradicted: D469 / D471 / D472 / D475 as the plan states them; D45 (nothing moves on the face
without an amendment — the face reads `w.wo`, never the working set); D103 / D98 (the four fall on a hide and return on
an unhide — once F1 and F3(b) are fixed); D183–D185, D188 (live warnings and the next-day mark stay live, their hide
state issued); D187 (a look shows its version's warnings — now its hides, struck, no door); D148 (undo by record
revision, the writer named); D346 ("The day" group); D473 (the table list in the same change). The one narrowing the
plan records (D187's "every warning shown" → "every warning, the hidden ones struck") is right and is the newer ruling.

---

## The three that matter most

1. **F1** — wire `hideDelta` into `dayPendingItemsIn` as well as `dayDelta`, or the count, the list and the panel read 0
   while the sign-offs fall and Publish AL1 lights.
2. **F2** — keep every `di:null` trace in the replay (and in `faceWarn`), or hiding any warning on the week removes the
   Sunday "Breaks Monday" mark.
3. **F3** — intersect `hideDelta`'s set with the working copy's warnings, and address the entry by a fingerprint of the
   key (never an index, never the words), or stale hides pend falsely and the four fall on a re-sort or a rename.

F4 (View-only Sched with no published day) is the next most visible — it is the member's screen in the mock.
