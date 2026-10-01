# [WARN-HIDE-KEPT] — the final read of the finished code: FABLE (1 Oct 26)

**Read:** branch `claude/warn-hide-kept` at HEAD against `main` — `git diff main...HEAD -- raptor-port/src raptor-port/e2e`
(3,676 lines, 44 files), every line; then the code the diff does not show around each changed site (the engine's
`validate()` / `faceWarn` / `officialFor` / `withIssuedWeek` / `snapGlobals`, the command layer's apply and backstop,
the boot and week load, the row writer, every reader of a day's warning list in `src/` outside the tests). The brief, the
plan (v2), the register (WH1–WH13), `ui-contracts.md` §Muting a check, the dispositions of the plan's red team, Astra's
scenario design, the evidence sheet (§4 roll-call, §5 the walk and its four fixes, §6 the break tests, §8 what was not
walked), the rulings' full rows (D469, D471, D472, D475; D45, D97–D99, D101, D103, D148, D168, D179, D183–D185, D187,
D188, D346, D363; D56), `raptor-executor.md`, the bug-check order §2b and §4. Read-only; no gate run, no server, no
other reviewer's report opened. **D56 honoured:** nothing below is about a record already stored.

**Verdict: APPROVE** — with one MEDIUM to fix before "merge live" (a cost, not a wrong answer) and four LOWs the
builder can take or file. No wrong flag, no wrong count, no wrong face, no lost or doubled hide found. **The three that
matter most: F1, F2, F3.**

---

## Findings

### F1 — MEDIUM — Next week's whole saved copy is parsed again on every ask for the face, once a mark crosses the week's edge (NEW)

**Scenario.** The owner's own case of 23 Aug 26: a Sunday duty till 23:00 and a man on next Monday's first wave, so
Sunday wears the dotted "Breaks Monday" mark. Next week has been opened and edited at least once (so it has a saved
copy). Open View-only Sched, or Edit Schedule, on this week and type into any box.
**Expected:** each repaint costs what it cost before this build. **Observed (by reading, not measured):** every repaint
re-reads next week's whole saved copy from text — once per published day drawn, once per ALL / ALL AVAIL chip, twice
per open issues list, once per open day box, seven times per puck tap — where `main` read it once per validate. On his
phone, with a next week carrying several published versions (each a whole day plus its warnings and face), that is
plausibly tens of milliseconds a repaint. Nothing on screen is wrong.

**Evidence.**
- `src/engine/validate.ts:1455–1456` (`shownWorking`) and `:1497` (`faceWarn`): `xw = raw.traces.some(di==null) ?
  nextMondayHides(CURWEEK) : NOHIDES` is computed BEFORE the memo check on both paths (`shownWorking`'s `SHOWN.get(raw)`
  at 1459; `faceWarn`'s `FACE_K===k` at 1499). With nothing hidden anywhere, `faceWarn` with no published day still
  pays it (`if(!fz.length) return shownWorking(raw)` → the `xw` line runs before `if(!hs.size&&!xw.size) return raw`).
- `src/engine/weekctx.ts:250–259` `dayHidesIn`: a published next Monday → `stashSched(v)` → `JSON.parse` of the whole
  week blob (`src/engine/weekstash.ts:127–135`, no memo); a draft next Monday → `JSON.parse(s)` of the same blob (line 256).
- The callers per repaint: `src/ui/html.ts:143, 224, 259, 262, 263` (`withOfficialWarn` → `faceWarn`, one per published
  day drawn), `:703` (`WARN===officialWarn()` per OIL chip), `:1084` and `:1087` ×2 (`dayWarnHTML` in diff mode),
  `src/state/view.ts:655` (`displayedBundle` — `warnFocusMap` per open box at 1063, `personFlagDays` ×7 at 574–582),
  `src/ui/Modals.tsx:47`.
- On `main`: `faceWarn` returned `off` at once with no published day and hit its memo otherwise; the only parse of
  next week's stash was `nextMondayWorked` (`git show main:raptor-port/src/engine/weekctx.ts`, line 229), once per validate.

**Fix (exact).** In `src/engine/weekctx.ts`, memoise `dayHidesIn` on the saved copy's identity — the blob is replaced
whole by `stashPut` / the hydrate / an off-week undo, so a new string object means a new answer, and `===` on the same
string object is a reference check:
1. Above `dayHidesIn` add: `const HID_MEMO=new Map<string,{s:any,set:Set<string>}>();`
2. Rewrite the head of `dayHidesIn`:
   `export function dayHidesIn(v:any,di:number):Set<string>{ const s=stashGet(v); if(!s)return new Set<string>();
   const mk=\`${v}|${di}\`, hit=HID_MEMO.get(mk); if(hit&&hit.s===s)return hit.set; const out=new Set<string>(); try{ …the
   existing body unchanged… }catch(_e){} HID_MEMO.set(mk,{s,set:out}); return out;}`
   (keep the comment; `s` is the string `stashGet` returns — do NOT key on `stashGenOf`, which `src/engine/weekstash.ts:106–107`
   does not bump on a direct restore).
3. Test, in `src/state/warnhide-published.test.ts` beside "the marks that cross the week's edge": after `loadWeek(W2);
   tap(cr); loadWeek(W1)` assert `nextMondayHides(W1)` returns the SAME object twice (`expect(a).toBe(b)`), and after
   `loadWeek(W2); tap(byCode(MON,'CREW_REST','bane')); loadWeek(W1)` a different object without the key.
4. Optional belt: in `faceWarn` move the `xw` line below the cheap `if(FACE&&FACE_OF===raw…)` check by folding `xw`
   into the memo key only when `fz.length` — not needed once step 2 is in; leave `validate.ts` alone if time is short.

### F2 — LOW — The To go out line for a hide never says who hid it or when, though the change history knows (NEW)

**Scenario.** Tuesday published and signed. Saber hides "Static has a long work day". A second admin opens the day's
"1 pending" → To go out. **Expected (D99 — "who changed it and when, where the app knows"; D469 — who hid it must be
answerable):** "Warning · Static — has a long work day …  flagged → hidden · Saber · 14:02", as a seat change shows its
author. **Observed:** the words and the from → to, no name and no time — while the All changes tab of the same window
lists "Warning · Static — …  flagged → hidden" with Saber and the time.

**Evidence.** `src/ui/pendlist.ts:278–283`: the `hide` branch returns `who: '', when: ''`; its `keys` are `[]`
(`src/engine/publish.ts:265`) so `lastEdit` (pendlist.ts:125) cannot find it. The history row exists:
`src/state/changelines.ts:450–456` writes `logAction(h.di, \`Warning · ${h.words}\`, {sect:'day', from, to})`, whose row
carries `t`, `who`, `di`, `lbl` (`src/engine/editlog.ts logAction`). The sibling `warn` axis (`faceWords`) is blank too
unless a Quals line is behind it — so this is consistent with a neighbour, not with D99.

**Fix (exact).** In `pendItemWords`'s `hide` branch (`src/ui/pendlist.ts:278–283`):
1. Build `where` first: `const where = x ? \`Warning · ${nm}${nm ? ' — ' : ''}${x.msg}\` : 'A warning'`.
2. Find the newest history line for it: `let who = '', when = ''; for (let i = ELOG.rows.length - 1; i >= 0; i--) { const r =
   ELOG.rows[i]!; if (r.di === di && r.sect === 'day' && r.lbl === where) { who = elogWho(r); when = elogWhen(r.t); break } }`
   (`ELOG`, `elogWho`, `elogWhen` are already imported at pendlist.ts:97; the label is built from the same `names — msg`
   in `src/ui/interactions.ts:1277–1279` and in `changelines.ts`, so it matches; after a rename the stored label keeps the
   old callsign and the match fails gracefully to blank).
3. Return `{ where, from: …, to: …, who, when, jump }`.
4. Test: in `src/state/warnhide-published.test.ts` WH8's first case, after the first `tap(...)`, assert
   `pendItemWords(TUE, dayPendingItems(TUE)[0]).who` equals `elogWho(ELOG.rows[ELOG.rows.length - 1]!)` and `when` is non-empty.

### F3 — LOW — The 7-day run's forward dotted mark following next Monday's hide is promised, untested and unwalked (NEW — a test gap, no defect read)

**Scenario.** Bane on the programme Monday to Sunday (7 days, the limit) and on next Monday: every day of this week
wears the dotted "7" run mark pointing at next Monday. On next week, hide Monday's "8 days in a row" warning; come back.
**Expected (plan §3.2, dispositions Astra 2 / Fable F2: "the run's forward dotted mark" follows next Monday's own
hide):** the dotted run marks on this week go, and come back on ↺. **What would disprove it:** the marks stay.

**Evidence.** `src/engine/validate.ts:357, 367`: the forward run trace carries `w = {di:null, code:'DAYS_RUN', who:[id],
msg: runSays(id, n+1)}`; `shownOf` (`:1426`, `xHid`) keys it as next Monday's `0|DAYS_RUN|id|<runSays(id, n+1)>`. That
matches next Monday's own warning only if that Monday's `RUNLEN[0][id]` is exactly `n+1` — true when `seedRunIn` counts
this week's run through the stash (it does for the loaded week's seed), but nothing proves it: the register's WH12 names
only Sunday's "Breaks Monday" and the preview's time box; `warnhide-published.test.ts:389–442` tests CREW_REST only; the
sheet's §8 does not list the run. If the two sentences ever differ by one day, the mark stays — the designed fallback —
and nobody would know.

**Fix (exact).** Add to `src/state/warnhide-published.test.ts` under "the marks that cross the week's edge":
1. `schedWrite(SCHED_TYPES.mutate, () => { for (let di = 0; di <= 6; di++) (DAYS[di] as any).dutywaves[0].rows.push({ role:
   'Duty', id: 'bane', str: '0900', end: '1000' }); view.afterSchedMutate() })` (7 days; if the demo already works him on
   some, add only the missing ones so the Sunday count equals `VCONF.maxRun`).
2. Assert `traceOf(SUN,'bane').run` is truthy and `traceOf(SUN,'bane').run.di` is `null`.
3. `loadWeek(W2)`; put him on Monday's duty row the same way; assert `byCode(MON,'DAYS_RUN','bane')` exists and its
   `msg` equals `runSays`'s sentence for `VCONF.maxRun+1` (import the sentence through a shown warning, not by retyping it).
4. `tap(byCode(MON,'DAYS_RUN','bane')); loadWeek(W1)`; assert `(traceOf(SUN,'bane')||{}).run` is undefined while
   `rawWarn().trace[SUN].bane.run` is still there; `loadWeek(W2); tap(...); loadWeek(W1)`; assert the run mark is back.
5. Add "the run's forward mark" to WH12's wording in the register.

### F4 — LOW — The Undo / Redo tests judge the SET, not the bundle every surface reads (NEW — tests only)

**Scenario.** `warnhide-kept.test.ts:149–160` and `warnhide-published.test.ts:371–387` (WH11) assert `view.warnShown(w)`
after `globalUndo()` / `globalRedo()`. `warnShown` reads `WARNOFF` directly (`src/state/view.ts:804`). If the restore
put the key back without re-validating, the pucks and counts would stay stale on screen and both tests would still
pass. **It does re-validate** — `src/state/sched-commit.ts:334` defers `HOOKS.reflow()` after every restore, and walker
C's step 31 saw every list, puck and count move — so this is a test passing for a reason it does not check, not a defect.

**Fix (exact).** In each WH11 case add, beside every `warnShown` assertion: after Undo `expect(sevOf(TUE,'wolf')).toBe('note')`
and `expect(workingWarn().byDay[TUE].warns.find(w => w.code==='LONGDAY').off).toBeFalsy()`; after Redo
`expect(sevOf(TUE,'wolf')).toBeFalsy()` and `.off` to be `true` (`sevOf`, `workingWarn` are exported from
`src/engine/validate.ts`; `sevOf` reads `WARN`, the bundle as shown). If the deferred reflow has not run by then, wrap
in `await vi.advanceTimersByTimeAsync(0)` first — that itself is worth knowing.

### F5 — LOW — The stored-record spec of an amendment's entries omits the new kind (NEW — a spec line)

**Evidence.** `src/engine/schema.test.ts:144` `ALDIFF.kind: {$lit:['add','delete','change','move','input','oil','warn']}`
is unchanged while `UKINDS` (line 145) gained `hide` and `DeltaKind` (`src/engine/canonical.ts:117`) gained `'hide'`.
The spec is applied to the seed records only (`describe('the seed records conform')`), the seeds carry no amendment, and
the row reader (`src/state/weekrows.ts`) checks no entry kind — so nothing fails today and a hide amendment reads back
(walker B, 38). But the record spec the IT side will be written from (D473) now says an amendment entry can never be a hide.
**Fix:** add `'hide'` to that `$lit` list; in `docs/data-schema.md` line 268 beside "`ukinds` gain `hide`" add "and a
stored amendment's `diff` carries a `kind:'hide'` entry per warning hidden or flagged again (`addr: hide:<di>.<fingerprint>`)".

### F6 — LOW — Observation, not a defect: a live warning worded differently in the two worlds cannot be hidden on the face until the neighbour is published (inherent in the approved design)

**Scenario.** Monday and Tuesday both published. Monday's last duty is edited on the working copy (pending there) so
that Tuesday's live crew-rest warning (D185) is worded with Monday's NEW end time in the working world and the ISSUED
end time in the official world. The scheduler hides it on Tuesday's list (the working wording). **Observed:** the line
is struck on Edit Schedule; the published face keeps the flag (its wording differs, so the key does not match);
Tuesday reads nothing pending for the hide (`hideNow` keeps only warnings the working copy also raises by key); ✕/↺
cannot reach the face's wording. Once Monday's amendment goes out the two wordings converge and the hide applies.
This is the key = words design both red teams approved, and the owner's "if things change that warning will appear
again" covers it. **Fix:** one sentence in `docs/engine-rules.md` §Publishing beside the hide: "a live warning's hide
keys on the working copy's wording; where the issued face words it differently because a published neighbour has an
unpublished change, the face keeps the flag until that neighbour's amendment is out". No code.

---

## Explicit negatives — what I checked and found sound

### 1. The engine
- **Every mark site names its warning's code.** Walked all ~30 sites the diff changes and the sites it leaves (they
  already named a live code): the DT chip → `DT_SUM`, the same-day TT → `TURN`, the four DNIF/LEAVE/INPUT sites hoist
  `wc` above both marks (validate.ts 619–620, 636, 646–647, 754–755), crew pairing, NO_IR, OCU_NO_IP, PAX_CREW, SANS,
  briefs, long day, clashes. The guard (`markcheck.ts`) runs after every `validate()` of BOTH suites — verified in
  `vite.config.ts:32` and `src/leavewar/test-setup.ts`. Its residual: a mark filed under a code the same man also
  genuinely carries that day is invisible to it by construction (the replay's grain is the guard's grain); I found no
  such site by reading.
- **`shownOf` copies, never mutates** — `{...w, off:true}` at the same index, `cp` map for `all`; raw warnings never
  carry `off` (pinned). Nothing hidden and no cross-week hide → the raw object itself, so parity stands. The replay
  uses `markWorse` / `markHigher`, the SAME bodies the day loop now calls (hoisted to module level, 505–506) — one body.
  `fz` / `lv` split by `LIVE_ON_FACE`, as the loop's `cls()`. A mark with no code is kept (`!code` → true) — and the
  guard forbids one.
- **Traces**: in-week by (day, code, man) through the shown `named` map; cross-week by the key next Monday's warning
  will carry, kept when it cannot be told (`xwk` absent, no stash, unparseable) — the fallback both reviewers asked for.
- **`validate()` order** (1640–1653): RAW_B ← raw; WARN = WORKING_B ← `shownWorking(raw)`; OFFICIAL ← `officialFor(raw)`
  (RAW either way). `snapGlobals` / `restoreGlobals` (1749–1750) need no change: `validateCore` never writes RAW_B or
  WORKING_B, and WARN is restored after the official pass. `officialFor` returns a fresh object every validate (the alias
  IS the fresh raw), so the `HIDENOW` and `SLICES` WeakMaps cannot serve a stale answer after a toggle; the `SHOWN` memo
  carries the hide set and the cross-week set in its signature; `faceWarn`'s key carries both plus the versions.
- **`restIfPlaced`** reads RAW_B for the backward dup and the Sunday trace (1869, 1879): a hidden breach still reads
  as existing, so placing a man never reads as creating it. `runIfPlaced` reads RUNLEN / RUNSEED / NEXTON (raw
  state), never the bundle. `crossDayIfPlaced`'s cache resets per validate. `lgFired` reads the shown `all` incl. the
  `off` copies — counts a hidden firing, as plan §10 leaves it.
- **No input found** for which a puck keeps a hidden warning's flag (the replay drops every mark of that day+code+man
  not named by a shown warning), loses a shown one's (a man's other warnings' marks replay unchanged), or for which
  nothing hidden fails to hand back the raw bundle.

### 2. The published record
- `hideDelta` in BOTH authorities with the same gates (`dayDelta` 533; `dayPendingItemsIn` 265 under `sc===SCHED`);
  `hidePending` (657–665) compares "hidden on the working copy" with the version's `w.wo` only for warnings the working
  copy also raises; a stale hide pends nothing (pinned). `pendingKey` (1347–1352) serialises `addr␟kind␟from␟to` of every
  entry → the hide entry (a fingerprint of the key, never an index or words) binds the four and leaves on ↺ (D98, D103).
- `alIssue` (1106–1141) stores `diff = dayDelta`, `units = dayPendingItems.length`, `ukinds = itemCounts` — all three
  carry the hide; `diffCounts` folds it into `chg` for an older record.
- `HOOKS.issuedWarn` (1595–1613): the slice stays RAW (the comparison), `wo` = effective keys only, `shown` only when
  something is hidden, `face` from the shown OFFICIAL slice (never WARN). Issuing an amendment first makes the new
  snapshot current, so the official pass judges the day as the working copy (pre-existing order, still right).
- `faceWarn` (1493–1535): a draft day under the working hides; a published day's frozen AND live warnings `off` by its
  issued keys; frozen marks `w.shown||w`; live marks replayed under the issued keys (`LV = off.lv`); the next-day mark
  follows the breach day's own state. `versionFaceWarn` (1545–1566) reads the stored face (its `off` kept through
  `rewordSlice`) or, for a version without one, `wo` + `shown`. Unpublish / `retiredEntry` / `issuedFromRetired` carry
  `w` whole, so `wo` and `shown` ride for free. The row writer (`weekrows.ts`) keeps `w` as one JSON value — nothing
  strips `wo` / `shown` on read-back (walker B, 38 reloaded past an amendment).
- `dayDiscardCount(di,toVer)` (713–758) and its three callers (`html.ts withDaySnap` before the swap, `SchedBoard.tsx:270`
  outside the swap, `interactions.ts:1077` before the load) agree; the "already at" short-circuit (1083) reads the same
  count, so a pending hide on the current version always runs the load. The load (`drafts.ts:681`) sets the hides
  BEFORE the caller's `afterSchedMutate()`, which the backstop wraps in a `mutate` command (`sched-commit.ts:749`) — so
  the change is captured and saved (and undoable); a saved plan is skipped by `isDraftVer`.
- `jumpToWarnLine` (interactions.ts 69–96): finds the line by key, opens the list (the board's fold on a phone), focuses it,
  lands on the LINE; a warning no longer raised says so.
- **No order found** after which a face shows or hides a flag it did not go out with while nothing is pending, a hide is
  counted twice or not at all, or two counts disagree. (F6 is the one edge, and there the face is right.)

### 3. Saved state
- `initStore` (store.ts 889–898) clears, applies the week, restores `wo` BEFORE the baseline — the next edit no longer
  erases the row's hides (pinned, red on `main`). `loadWeek` (649–654) still restores after the 'week' reset; WARNOFF is
  out of the 'session' scope (view.ts 869) so a sign-in keeps it; `resetSession`'s resync is now a no-op belt.
- `weekStashSnap` carries `wo` (451–452); the row writer files each key by its leading day (`weekrows.ts:174–179`), a
  cross-week key is never stored (effective keys of the day's own warnings only); `sched.mutes` is applied per day
  (`sched-commit.ts:248–253`) and every restore defers `HOOKS.reflow()` (334) — Undo / Redo re-validate. D148: the
  `sched.mutes` record is in the undo derivation (`undo/derive.ts:18`) and pinned by `sched-dayrecords.test.ts`.
- `toggleWarnOff`'s `validate()` inside the command is safe on every path I traced: it writes module globals and DOM
  counters only, never a record; the command's own epilogue validates again. The old `histSnap` / `histRestore` still
  carry `wo`. **No order found** after which a hide is lost, doubled, on the wrong day or week, or written outside a command.

### 4. Every reader
- Enumerated every non-test reader of a day's warning list in `src/` (`.warns`, `WARN.all`): html.ts (`fltNoLenShown` 97,
  `exemptDeskOwn` 596, `exemptLineOwn` 608–623, `personWarnMsgs` 826, `dayWarnHTML` 1067–1160 incl. `goneW` by
  code/people, `dayInfoHTML` 2175–2222), board.ts (`boardWarnHTML` 431, `fltNoLenShown` 210), board-html.ts (`sbSlot` →
  `exemptLineOwn`), insights.ts, Modals.tsx, view.ts (`personFlagDays`, `focusWarn`, `warnFocusMap`), interactions.ts (the
  taps by index), dropflag.ts (`warnDelta` skips `off`; `flagDrop`'s before/after are both the shown bundle), pendlist.ts
  (`faceWords` — raw slices, by design), peek.ts (`dayHidesIn`), palette-html.ts / highlights.ts (the maps / WFOCUS).
  Each reads the warning's own `off` or `shownWarns`, never the working set — so a look and a face show their own hides.
- `view.ts openWarns` (697) counts hidden lines but has no caller in the app (probe bridge only); `engine/avail.ts
  personWarnDays` (132) likewise is test-only. Neither reaches a screen; if either is ever wired, add `!w.off`.
- `html.ts:703` and `:1084` (the two "which world" identity checks): sound by construction — with nothing published the
  shown working bundle and the face are one memoised object; pinned by `availwin.test.tsx` WH9.
- The exempt flying seat: one body for the week and the board (`exemptLineOwn`); same semantics as the week's old inline
  `own` (PV/OFW gate widened to the board's `off`, the `also` match kept); the board's `pv` preview still draws plain.
- **No reader missing from the roll-call** that a person can see.

### 5. The tests
- Every register line names a test that asserts it (WH1–WH13 read); the break tests cut a real wire each. Fixtures
  mutate through the app's doors (`schedWrite`, `toggleWarnOff`, `setSign`, `commitSetDayApproved`); the one direct
  mutation (`PEOPLE.wolf.cs = 'Statik'`) is restored. The replay is proven by `force` (not the identity path). The guard
  cannot be bypassed by a mark that names no code. The gaps: F3 (the run's forward mark), F4 (Undo judged by the set),
  F5 (the spec's kind list).

### 6. What the walk could not see
- D148's refusal: the `sched.mutes` record and its revision check are the same machinery every day record uses; pinned.
- A BB seat's own warning: `exemptLineOwn` keys on `saExempt(w,f,a)`, which BB satisfies as AVALON's twin — no BB special case.
- One man wearing both TT kinds: the two chips are filed under `TURN` and `CREW_TIGHT`; the replay keeps whichever's warning
  still shows. A duty desk with no times: `exemptDeskOwn` unchanged but for `shownWarns`.
- The phone's preview: not drawn; the Amendments panel on a phone: reads `ukinds` / `itemCounts`, which carry the hide.

**Rulings: none this read.**
