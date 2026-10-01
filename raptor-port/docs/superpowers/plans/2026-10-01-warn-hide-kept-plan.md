# [WARN-HIDE-KEPT] A hidden warning: kept for everyone, no flag, struck out, not counted (plan, 1 Oct 26)

**Branch:** `claude/warn-hide-kept`, cut from `main` after PR #477 (`[DB-READINESS]` phase 7) merged.
**Rulings:** D469, D471, D472, D475 (full rows `.claude/decisions-full/scheduler.md`). **Backlog:** `OUTSTANDING.md` `[WARN-HIDE-KEPT]`.
**Picture:** `docs/mock/warn-hide.html` — APPROVED as drawn, 1 Oct 26 (D475: "The mock up looks good. Proceed"), its three calls with it (§7).
**Process:** HEAVY, said so — saved data, the published record and the warning list are all touched, and a defect in
any of them is silent. This plan is red-teamed by BOTH reviewers before the build (D353); Astra designs the scenarios;
the walk; then BOTH read the final code.

## 1. What he ruled, in one place

1. A hidden warning **stays hidden — for everyone, across a reload and a sign-in — until someone unhides it** (D469).
2. While hidden, **the pucks carry no flag for that item** (D469) — no ring, no chip, no dotted mark.
3. Its line **stays where it is in the day's list, struck out and darker, one tap from being flagged again** (D469);
   the "N hidden" fold goes.
4. It is **not counted**: 3 issues with one hidden reads "2 issues", and the count line says nothing about a hidden one
   (D472). (This replaces the Aug 26 "the header keeps its true count and colour" for the count and the pucks.)
5. On a day **already published a hide waits for the next amendment**, like every other change to a published day — it
   reads pending and the four sign-offs fall (D471, D45, D103).
6. **The published and printed schedule drop the hidden item's flag too** (D471).
7. Kept from the Aug 26 rule: only a scheduler hides and unhides; a hide is an Undo step; a hidden warning comes back by
   itself when the situation changes (the hide is tied to that exact warning).

## 2. What the code does today (read 1 Oct 26)

- **The set.** `state/view.ts WARNOFF` — keys `day|code|people|message` (`warnMuteKey`). Written by the ✕ / ↺ on a line
  (`ui/interactions.ts`, command `sched.warnMute`), saved with its day (`sched.mutes/<wk>#<di>` → the day row's `wo`).
- **Lost at boot and at sign-in.** `store.ts initStore` restores the week on screen through `applyWeekModel` and throws
  its return away — `loadWeek` reads `wo` back from it, the boot does not. The baseline is then taken with no hides, so
  **the next change to that day rewrites its row without `wo` — the saved hides are erased, not only unread**. And
  every sign-in runs `resetViewState('session')`, whose registry entry clears `WARNOFF`.
- **The lists.** `ui/html.ts dayWarnHTML` (Edit Schedule, View-only Sched, a look at a version) and `ui/board.ts
  boardWarnHTML`: the count is every warning; a hidden one leaves the list for the "N hidden" fold (`WMOPEN`), on the
  edit surfaces only — View-only Sched, a look and a published face ignore hides altogether.
- **The pucks.** Rings, chips and dashes are written by ~48 mark sites inside `engine/validate.ts validateCore`
  (`markRing` / `markChip` / `markDash` / `markTrace`), each beside the `add(…)` that raises its warning. A man's ring is
  the worst of his warnings; nothing records WHICH warning raised a mark, so a hide cannot take its flag away today.
- **A published day.** Each issued version keeps the day's warnings as they went out (`snap.w`: the list, and the rings /
  chips / dashes of the warnings that freeze; `w.face` the whole face for a look at an older version). The face is
  `validate.ts faceWarn` (stored warnings + the ones that stay live — `LIVE_ON_FACE`, D183–D185). "Pending" is
  `publish.ts dayDelta` = content + filing + inputs + OIL + `warnDelta` (one entry when today's judgement of the issued
  day differs from the stored slice). The four sign-offs are bound to `pendingKey(di)`, which serialises every `dayDelta`
  entry — a new entry drops them, by itself. **Nothing about hides is stored with a version or compared.**
- **No history line.** A hide writes nothing to the change history; only the Undo label names it ("muting a warning").

## 3. The design

### 3.1 One key, one question
- `engine/warnhide.ts` (new, small): `hideKey(w)` = `di|code|who|message`, the message with each named man's callsign
  replaced by his id (`publish.ts warnMsgKey`'s fold) — **a rename is a label, not the situation changing** (14 Sep 26), so
  it must not bring a hidden warning back, least of all on a published face. `view.warnMuteKey` becomes this function.
  *(The key's shape changes; hides stored by today's build stop matching — demo data, D56.)*
- The engine cannot import `state/`: `HOOKS.hiddenKeys(): Set<string>` (set by `state/view.ts`, returns `WARNOFF`) is the
  working set as the engine reads it; unset (an engine-only test) nothing is hidden.

### 3.2 Each mark knows its warning; the bundle is drawn "as shown"
- In `validateCore` every mark site passes the code of the warning beside it (about 30 sites gain an argument; the 18
  that already name a live code are unchanged; `cls(code)` answers the same for every code that freezes). Each mark is
  also appended to `marks` — `{k:'sev'|'chip'|'dash', di, id, v, code}`; each trace to `traces` — `{pdi, id, t, di, code}`
  (`CREW_REST` / `DAYS_RUN`, the day the breach is on). The maps are still written as they are today.
- `shownOf(raw, hidden)` (pure, memoised per raw bundle): **nothing hidden → the raw bundle itself** (so every byte of
  today's behaviour, and the reference parity, is untouched). Otherwise a copy: each hidden warning replaced by a copy
  carrying `off:true` (same index — `data-wix` and the focus stay valid); `sev` / `chip` / `dash` / `fz` / `lv` /
  `trace` rebuilt by replaying `marks` and `traces` through the same `ring` / `flag` rules, **skipping a mark when no
  SHOWN warning of that day and code names that man**. So a man with two warnings keeps the flag of the one still
  showing, and two warnings of one code on one man both have to be hidden before that code's flag goes.
- `validate()`: `WARN` and `workingWarn()` become `shownOf(raw working, working set)`; `OFFICIAL` (`officialRaw()`) stays
  RAW — it is the comparison's detector and what a version stores, and a hide must never read there as "warnings on this
  day changed". A test pins: with nothing hidden, `shownOf(raw) === raw`, and replaying `marks` rebuilds the very maps
  the day loop wrote (both demo weeks).

### 3.3 Every reader — the roll-call (§5)
The maps are already filtered, so every puck that reads them follows without a per-surface change. Four kinds of reader
need their own line, and §5 names each:
- a LIST draws an `off` warning struck out;
- a COUNT, a "worst colour", a "flagged on" list and the Insights numbers skip it — ONE helper, `shownWarns(warns)`
  (`engine/warnhide.ts`), used by every counter;
- a reader that works out a flag FROM THE LIST, past the maps (an exempt desk row, an exempt flying line, the ALL AVAIL
  window's reasons, the names lit by an open day box, the days a puck's tap opens, the drop toast) skips `off` warnings;
- an ENGINE question about whether a breach already EXISTS (the pre-drop crew-rest probe) reads the RAW working bundle
  (`rawWarn()`), never the shown one — a hidden breach is still there, and placing a man must not read as creating it.

### 3.4 A published day
- **At issue** (`HOOKS.issuedWarn`): the stored slice `w` stays the RAW slice (the comparison's basis, as today), and gains
  `w.wo` — the keys of the day's warnings hidden as it goes out (effective keys only: a stale key is not stored);
  `w.shown` — the frozen-class rings / chips / dashes as shown, when anything is hidden; and `w.face` is taken from the
  shown bundle (its warnings carry `off`, its rings are the shown ones). `wo` and `shown` ride inside `w`, so
  `retiredEntry` / `issuedFromRetired` carry them with no change; `warnSliceKey` reads neither.
- **The face** (`faceWarn`, `versionFaceWarn`): a published day's warnings — stored and live — are marked `off` by the
  ISSUED keys (`w.wo`), never the working set; its frozen marks are `w.shown` when present; its live marks are replayed
  from today's official `marks` under the issued keys. A draft day inside the face keeps the working set. The next-day
  mark (`trace`, live by D183) follows the hide state of the breach's own day: the issued keys when that day is
  published, the working set when it is not.
- **Pending** — a new axis beside `warnDelta`: `hideDelta(di)` (`publish.ts`, through `HOOKS.hideNow(di)`): for each
  warning of today's judgement of the ISSUED day (both classes), "hidden on the working copy" against "hidden as
  issued"; **each one that differs is ONE pending change** (`kind:'hide'`, `addr:'hide:<di>.<n>'`, carrying the warning's
  words and which way it went). `dayDelta` concatenates it, so the day's count, "Not yet signed" / "Not yet published",
  the publish button and the sign-offs (through `pendingKey`) follow with no further change. A warning that exists only
  on the working copy (an edit not yet out) is not in that list: its hide goes out with the edit that raised it.
  Hide then unhide → nothing pending and the four are valid again (D98).
- **The pending list** (`ui/pendlist.ts`): "Warning hidden" / "Warning flagged again", the warning's own words under it,
  in the group "The day" (D346); counted under "changes" in the Amendments panel.
- **Publishing the amendment (or the EOD version)** stores the new keys — nothing pending. **Unpublish** falls back to the
  version before; the working hides stay and read pending again (D101). **"Load onto working copy"** sets the day's
  working hides to the loaded version's (`HOOKS.setDayHides(di, keys)`), so a day loaded back to what is published reads
  nothing pending (D98); its confirm's count includes them.
- **A saved plan, a template:** hides belong to the DAY, not to a plan; a key that matches no warning is inert.

### 3.5 Kept with the day, for everyone
- `initStore` restores the week's saved hides (the line `loadWeek` has) before the baseline and `histInit()` are taken.
- `WARNOFF` leaves the 'session' reset (it stays in 'week', where `loadWeek` restores it right after); `resetSession`'s
  re-sync stays, harmless.
- A toggle re-runs `validate()` (the bundle is "as shown"), on the click, on Undo / Redo and on a restored record.
- **A history line** (new — he did not ask; the hide is now shared, so "who hid it" has to be answerable): "hid a
  warning — <its words>" / "flagged a warning again — …", under "The day".
- Roles: unchanged — `sched.warnMute` is already a scheduler's write in `state/perms.ts` (the §11 table has its row).

### 3.6 The lists, as drawn in the picture
- Edit Schedule and the board: the line in place, `.hid` (struck out, grey, dashed outline on the week), its ✕ become ↺
  at full strength; `WMOPEN`, `toggleWarnMuted`, `.wmuted-h` and the "N hidden" line are removed.
- View-only Sched, a look at a version, a guest: the same struck line with no button (call 1, §7).
- Every issue hidden: Edit Schedule keeps a quiet bar, "✓ No issues · tap to review"; the board's heading reads "No
  conflicts flagged for <day> ✓" with the struck line under it (call 2, §7).
- The bar's colour and the "N warning" count come from what is shown.
- A tap on a struck line still jumps to and lights its crew (so a scheduler can see what was hidden).

## 4. The rulings that apply (the rules sweep — each walked, pass or fail, in the evidence sheet)

| Ruling | What it demands here |
|---|---|
| D469, D471, D472, D475 | §1; the picture is the design of record (§3.6) |
| Aug 26 "mute a specific check" (`ui-contracts.md`), 29 Aug 26 "both in sync" | one set for the board and the edit week; keyed by content; returns when the situation changes; an Undo step; a scheduler's alone |
| D45, D103, D97, D98 | nothing on a published day changes without an amendment; anything pending drops the four; "Not yet signed" / "Not yet published"; back to what was published = nothing pending |
| D99, D100, D168, D340, D345, D346, D119 | the hide is named in the one changes window's "To go out", newest first, under "The day" |
| D179, D183, D184, D185, D188 | what freezes and what stays live on a published face — unchanged; the hide state of BOTH kinds is the issued one |
| D187 | a 👁 look at a version shows ITS warnings — and now its hides, struck, read only |
| D101, D363, D175 | Unpublish; loading an older version; a load never lands a request twice — untouched, the hides follow the version |
| D94, D164, D270, D272, D277 | the three rings on the board as on the week; no glow; his own puck — a hidden flag gives the purple "this is you" ring back |
| D38–D41, D65 | the ALL AVAIL window's pucks are real pucks, flagged — they follow the same maps |
| D148, D338 | Undo takes back only his own hide; refuses if another has changed that day's hides since; the history outlives a sign-out |
| D213, D215 | a guest sees what a member sees on View-only Sched |
| "No warning counts in the top bar" (20 Aug 26); "a clicked warning lights its crew in the warning colours" | untouched |
| D56, D54 | hides stored by an older build stop matching — demo data, not a finding |
| D473 | `data-schema.md` and `data-model.md` updated in the same change (`w.wo`, `w.shown`, the key's shape) |

No clash between rulings found. One narrowing to record in the docs: D187's "every warning shown" on a look now reads
"every warning, the hidden ones struck out" (D469 is the later ruling).

## 5. The roll-call — every place a warning is drawn, counted or flagged

From a sweep of every reader of the warning bundle (1 Oct 26; file and line as on `main` at 92e75209). **F** = follows
by itself (reads the filtered maps); **L** = a list, draws the line struck; **C** = a count, uses `shownWarns`;
**S** = scans the list for a flag, must skip `off`; **R** = must read the RAW bundle; **—** = must not change, because….

| # | Where a person sees it | Code | Kind |
|---|---|---|---|
| 1 | Every puck's ring, red box, dashed box, dotted outline, chip and hover words — week and board, cockpit seats, duty / sim / ground / programme seats and extras, the Available-crew grid, SANS cards, Unavailable / Personal Inputs rows | `ui/html.ts` `sev` / `chip` / `dsh` / `traceHit` / `puckMarks` (66–94), `puckHTML` (436–515); `board-html.ts` 138, 234, 329–338, 661, 814 | F |
| 2 | The crew list beside the week and the board | `ui/palette-html.ts:61` (`sevOf` / `chipOf`) | F |
| 3 | The ALL AVAIL window's pucks | `ui/html.ts personPuckHTML` (782) in the chip's world | F |
| 4 | The ALL AVAIL window's reason under a puck, its "flagged" class and "N men are flagged" | `ui/html.ts personWarnMsgs` (789–796), `AvailWindow.tsx` 175–198, 243, 345 | S |
| 5 | An exempt duty desk's own red ring + C (a `noconf` block), week and board | `ui/html.ts exemptDeskOwn` (578–586) | S |
| 6 | An exempt flying line's own ring (SC SPARE, AVALON, BB) | `ui/html.ts` 1765–1778 | S |
| 7 | The red time box of a flying line that takes off and lands at the same time | `ui/html.ts` 1703–1714, `board.ts` 209–215 (`fltNoLen`, not the bundle) | S — hidden when the day's `FLT_NO_LEN` warning for that line is `off`; the next-week peek (`peek.ts` 105) has no warning list and keeps it — said in §10 |
| 8 | Edit Schedule's and View-only Sched's day list: the count, the worst colour, the rows | `ui/html.ts dayWarnHTML` (1030–1148) | C + L |
| 9 | …its "also flagged on Tue, Wed" line and the list narrowed to one man | `engine/avail.ts personWarns` (137), `state/view.ts selectPerson` (570–602) | S (a day counts when a SHOWN warning names him or a shown trace is on him) + L |
| 10 | …its "new once signed" / "goes away once signed" rows and "N to clear once signed" | `ui/html.ts` 1047–1054, 1114 | — compared by code, people and day, the hide state not in it: a hide is its own pending line, never a "new" or "gone" warning |
| 11 | The cross-day rows "Breaks <tomorrow>" on the day that caused it | `ui/html.ts dayTraceHTML` (943–1007), `soloTrace` | F (reads the filtered `trace`) |
| 12 | The board's issues panel: the count, the colour, the rows, the selected man's rows | `ui/board.ts boardWarnHTML` (430–512) | C + L |
| 13 | The day-info popup (ⓘ): "N warning / N advisory / N note" and its list | `ui/html.ts dayInfoHTML` (2159–2223) | C + L (it kept the whole list on purpose under the Aug 26 rule; D472 now says a hidden one is not counted — the line stays, struck) |
| 14 | Insights: the week's total, "Conflicts by type", "By day" | `ui/Modals.tsx` 66–106, `engine/insights.ts` 35–40 | C |
| 15 | The Logic page's "fired N×" beside each rule | `engine/validate.ts lgFired` (1784), `LogicPage.tsx` | — it says how often a RULE fired, not how many issues a day shows; a hidden warning still fired. Left, said in §10 |
| 16 | The names lit while a day's box is open; a tapped line lighting its crew | `state/view.ts warnFocusMap` (1018–1049), `ui/highlights.ts` | S for the open box; a TAPPED hidden line still lights its crew (so what was hidden can be found) |
| 17 | The toast and the blink after a drop that raises a new warning | `state/dropflag.ts` 55–99 | S (a warning that arrives already hidden says nothing) |
| 18 | The pre-drop "this would break his crew rest" strike in the crew list | `engine/validate.ts` 1743, 1753 (`already`, `traceOf(6,id)`) | R |
| 19 | The pending line "Warnings on this day changed" | `publish.ts warnDelta`, `ui/pendlist.ts faceWords` | — reads the RAW official slice and the RAW stored slice; a hide is never this line |
| 20 | A published day on View-only Sched; the 👁 look at a version, week and board | `validate.ts faceWarn` / `versionFaceWarn`; `html.ts` 143–253; `SchedBoard.tsx` 253 | the ISSUED hide state (§3.4): F + C + L, no button |
| 21 | A guest's View-only Sched | `html.ts` 247, 1588 | F for the pucks; no list is drawn for a guest today — unchanged |
| 22 | The printed schedule (PDF) and the CSV | `ui/printpdf.ts`, `ui/export.ts` | — neither prints a warning, a ring or a chip today, so D471's "printed schedule drops the flag" already holds; a test pins that they read no warning |
| 23 | The next-week preview, the Inputs calendar, the Medical view, OIL Earn mode, the placeholder pucks, the Leave War, the Tracker | — | — draw no warning flag |
| 24 | The top-bar counters | `validate.ts` 1525–1529 | — the elements are gone (20 Aug 26); untouched |
| 25 | The ✕ / ↺ itself; a tap on a list row (week, board, the popup) | `ui/interactions.ts` 1222–1242, 1260, 1341–1381 | the key from the DISPLAYED bundle's warning; rows keep their index |

**Doors (the door check).** Hide: ✕ on a shown line — Edit Schedule's list and the board's panel, a scheduler, the
working copy only. Flag again: ↺ on the struck line, same places. Undo / Redo: the top bar's pair and the board's.
No door on View-only Sched, a look at a version, a member's or a guest's screen (the line is drawn, the button is not).

## 6. The eight questions (bug-check order §5) — tier FULL
1 Earned leave: NO — OIL reads the issued evidence block, never a warning or a flag. 2 The published record: **YES** (a
new pending axis, what a version stores, the face). 3 Saved data: **YES** (the boot read-back, `w.wo`, the key).
4 A shared drawer: **YES** (the bundle every puck reads). 5 A new gesture: no (the ↺ exists; its place changes).
6 A new surface: no. 7 Roles: **YES** to be safe (who sees the struck line; who may unhide). 8 The warning list: **YES**.

## 7. For him (product, not technical) — ANSWERED 1 Oct 26 (D475): approved as drawn
1. View-only Sched shows the struck-out line, with no ↺ — or should only schedulers ever see it?
2. A day with every issue hidden keeps a quiet "✓ No issues" bar that opens the list.
3. The look of the hidden line.
All three stand as drawn (D475).

## 8. The build, in order (each step red first)
1. `engine/warnhide.ts` — the key, `shownOf`, `shownWarns`; `validateCore` — the code on every mark, `marks`, `traces`;
   `validate()`, `rawWarn()`. Tests: the identity and replay invariants on both demo weeks; **every mark has its warning**
   (for each mark, a warning of that day and code names that man — on both demo weeks and the rule tests' fixtures); one warning hidden → its flag gone, the other man's
   kept; two warnings of one code on one man; a hidden crew-rest breach drops the dotted mark on the day before; a hidden
   7-day run drops its dotted run; the key under a rename.
2. State — the boot read-back; the session reset; the toggle re-validates; Undo / Redo; a restored record.
   Tests: hide → reload → still hidden and still SAVED after the next edit of that day; hide → sign out → sign in.
3. The lists and the counts — `dayWarnHTML`, `boardWarnHTML`, and every counter of §5; the CSS; `WMOPEN` removed.
4. The published day — `issuedWarn` (`wo`, `shown`, the shown face), `faceWarn`, `versionFaceWarn`, `hideDelta`,
   `pendlist`, the load, the history line.
5. Documents — `ui-contracts.md` §Muting a check (rewritten), `data-schema.md`, `data-model.md` §9,
   `feature-impact.md` (the Warnings row, the frozen-face row), `engine-rules.md` (the published day's warnings),
   the comments at `view.ts`, `file-map.md`, the behaviour register lines, `OUTSTANDING.md`.
6. The FULL check — §11.

## 10. Left as it is, said so
- The Logic page's "fired N×" counts a hidden warning (§5 row 15).
- The next-week preview keeps the red time box of a nought-minute line (it draws no warnings at all).
- A crew-rest or 7-day mark that crosses the week's edge (Sunday → next Monday) points at a warning in a week that is
  not loaded; it follows that week's hides only once that week is the one on screen.
- A callsign in a warning's words belonging to a man the warning does not name: renaming HIM changes the words and the
  hidden warning returns (the key folds only the named men).

## 11. The checks, in order
Gates → the roll-call and the door check → Astra's scenarios → the walk (both widths, a published day and a draft day,
both orders across the publish line, reload, sign-out, a member, a guest, a look at an older version, the print) → fix,
red first → gates → BOTH final reads with the evidence sheet → fix → re-walk → the sheet
(`docs/handpass/2026-10-01-warn-hide-check.md`) → his look.
