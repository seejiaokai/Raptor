# [MSQ-PLAN-AUDIT] roll-call: the bell's audiences and the Leave War and Tracker doors (chat 126, 20 Nov 26)

Gathered by an Opus helper for the roll-call brief `2026-11-20-msq-plan-audit-rollcall-brief.md`. Scope: who is TOLD (`state/notices.ts`,
`state/changelines.ts`, the tellers in `leavewar/sync.ts`), the Leave War's doors (`leavewar/sync.ts`, `leavewar/state/store.ts`,
`leavewar/state/foreign.ts`, `leavewar/engine/access.ts`, `leavewar/ui/`), and the Tracker (`tracker/`). Not `perms.ts`,
`accounts.ts`, `units.ts` or Admin → Users, which other helpers have. Line numbers are as of commit `d0bc24dc1`.

How the Leave War and the Tracker decide "who" today: the war's `role` is the session's admin role in force (`state/store.ts` l.480,
l.530 → `leavewar/state/store.ts setRole` l.2967), and the war loaded is always the signed-in person's home (`state/store.ts`
l.459–465 → `sync.ts swapWarWorld` l.2130). The Tracker binds to `myUnit()` at its first load (`boot.ts` l.90, `tracker/storage.js`
l.59–72). So "an admin" on either page means "an admin of the page loaded, which is his home's". Neither a master admin nor a Plan
holder can open another squadron's war or Tracker today (the Schedules menu and `pageUnit` are later steps, D2197, D2241), so they are
treated alike there.

**Count: 58 rows — HAS IT 46 · MISSING 7 · WRONG 3 · MUST NOT 2 · WORDS 0.**

| # | file:line | function or door | what it decides | who it lets in today | verdict | scenario and fix (MISSING, WRONG, WORDS only) |
|---|---|---|---|---|---|---|
| 1 | state/notices.ts:136, 161–174 (l.171–172) | `filerTold` / `filerVia` | whether an input's filer, not named in it, is told of a change, and through which squadrons (`Notice.fu`) | named men; a filer at home who has not moved since filing; a moved filer who is his home's admin today where that home is a named man's (l.171 role + home); a master admin; a Plan holder of a named man's squadron (via `adminThen`) | HAS IT | — |
| 2 | state/notices.ts:296–303 | `adminThen` | "a right in that squadron on that day" for filer lines and their retirement | no day: `levelOfAccount === 'admin'` (master, home admin, Plan); with a day (every caller): the master mark or an admin grant held before that day began; home admin left out on purpose (home handled in `filerVia`) | HAS IT | — |
| 3 | state/notices.ts:308 | `inputUnit` | the squadron of an input naming nobody (ALL AVAIL), for the filer test and the gate's 7c | neutral — the filer's home on the input's date | HAS IT | — |
| 4 | state/notices.ts:319 | `changeFiler` | who is told as the filer: the before-image's `by` | neutral | HAS IT | — |
| 5 | state/notices.ts:326 | `APP_ACTS` | which commands tell with no name (delete, posting pass, posting) | neutral — a Plan holder's Delete of a 149 man tells as the app, as a home admin's does | HAS IT | — |
| 6 | state/notices.ts:464–577 (tell l.486–493) | `noticePass` | who is told of a change to an input | every man named before or after, and its filer while row 1 says so; never the actor; never a man deleted, archived or a placeholder | HAS IT | — |
| 7 | state/notices.ts:584 | `noticeHoliday` | writes the holiday line to the list it is handed | whoever `holidayTodo` names (rows 25–26) | HAS IT | — (the audience is rows 25–26) |
| 8 | state/notices.ts:627 | `noticeAboutHim` | which lines follow a man on a move | neutral | HAS IT | — |
| 9 | state/notices.ts:661–710 (l.682–687, l.698–709) | `noticeLeftBell`, filer lines | whether a filer-only line leaves his bell on each move day | kept while the master mark or a Plan grant in one of the line's squadrons was held before that move day | HAS IT | — (see unsure 3: D2203 not built) |
| 10 | state/notices.ts:711–714 | `noticeLeftBell`, other lines | a moved man's old-squadron lines leave his bell | neutral; a Plan holder's lines of another squadron leave on his own move, as D2203 ends his Plan | HAS IT | — (see unsure 2) |
| 11 | state/notices.ts:722–774 (l.752, l.761) | `noticeLive` | posting and holiday lines shown only while the reader may edit the schedule (member view hides them) | the reader's admin role in force, any squadron — the line was already addressed to him | HAS IT | — |
| 12 | state/notices.ts:776 | `holidayLineOn` | his own live holiday line on a date (the bell's tap) | the reader himself | HAS IT | — |
| 13 | state/notices.ts:785–788 | `holidayLineAny` | "is a holiday line live on this date on any scheduler's bell" — the OIL list's foot (ui/OilDayList.tsx l.64) | any squadron's scheduler — no squadron asked | WRONG | Hunter adds Tue 1 Dec as a public holiday on 142's Leave War while 142 has nothing on it to answer and Osprey (149) has an overseas duty on 1 Dec, so only Kestrel is told (row 25). Hunter then drags OD over three 142 men on 1 Dec: the OIL list opens with 142's three and its foot says "What is left goes to the schedulers' bells" — read from Kestrel's 149 line; no 142 scheduler's bell carries one. Fix: ask only lines whose reader is a scheduler of the list's squadron (its home admins and its Plan holders), the list passing its squadron in. Not a Plan fault — a cross-squadron one found on the way. |
| 14 | state/notices.ts:800–812 | `noticeWar` | writes a war line; never to its maker or a man gone | whoever the caller names (rows 35–37) | HAS IT | — |
| 15 | state/notices.ts:818–830 | `noticePosting` | writes the posting lines | whoever the caller names (row 31) | HAS IT | — (the audience is row 31) |
| 16 | state/notices.ts:834–842 | `noticePostingBack` | writes one "taken back" line; never to the presser | whoever the caller names (row 34) | HAS IT | — (the audience is row 34) |
| 17 | state/notices.ts:866–886 | `setDerivedNotices`, `allNoticesFor`, `noticesFor` | a bell lists only lines addressed to its reader, plus the lines it works out (rows 32, 36) | the reader himself | HAS IT | — |
| 18 | state/changelines.ts:252, 270–283 | `actorIsAdmin` in the war's history lines | whether a removed bid reads "deleted" (an admin's decision) or a member's own withdrawal | any admin role (the act is on the war loaded, his home's) | HAS IT | — |
| 19 | state/changelines.ts:323–334 | bids taken out of another squadron's stored war | the history line filed under that squadron (`lwx.rec`'s unit) | neutral — whoever acted; a Plan holder's act on 149 files in 149's history | HAS IT | — |
| 20 | state/changelines.ts:468–477, 730 | `ledgerLines(c, unit)` | a ledger line from another squadron's stored war filed under that squadron | neutral | HAS IT | — |
| 21 | state/changelines.ts:633–647, 649–680 (l.677) | `peopleLineUnit`, `keepLineUnit`, `logReversed` | a roster change, and its Undo and Redo, filed with the man's own squadron | neutral — whoever acted | HAS IT | — |
| 22 | leavewar/sync.ts:301 | `setLwUnitProbe` | tells the gate whose war is loaded | neutral | HAS IT | — |
| 23 | leavewar/sync.ts:2130–2145; state/store.ts:459–465, 864–867 | `swapWarWorld`, `sessionUnit` | whose Leave War a sign-in loads: his home's | everyone his own; no pick for a master admin or a Plan holder (D2197, D2241 come with the Schedules menu) | HAS IT | — |
| 24 | leavewar/sync.ts:1458 | `schedulerIds` | the base set of schedulers: every admin account switched on and tied to a person | any admin of any squadron (role alone) — every caller narrows it (rows 25–26, 31) | HAS IT | — |
| 25 | leavewar/sync.ts:1511–1512 (with `oilAskPlan` l.1340, `oilOpenOn` l.1405) | `holidayTodo` → `toFor` | who gets "Inputs need an OIL answer" for a holiday | every scheduler whose HOME squadron has an input asking OIL on those days — judged by the loaded war's holidays, so another squadron's admins too | WRONG | Hunter adds Tue 1 Dec as a public holiday on 142's Leave War; Osprey (149) has an overseas duty on 1 Dec, which `oilAskPlan` judges by 142's holiday, so Kestrel's bell gets "Public holiday · Tue 1 Dec / 1 input needs an OIL answer" about 142's holiday (D2195: "no bell line goes to the other squadron for a holiday"). Fix: already planned — reshape plan A4 (`holidayTodo` tells its own schedulers only; each squadron's input judged by its own holidays). |
| 26 | leavewar/sync.ts:1511–1512 | `holidayTodo` → `toFor` | the same line, for a Plan holder of the squadron | a Plan holder is told only through his HOME squadron's inputs, never the squadron he holds Plan of; a master admin through his home only (D2198 — right) | MISSING | Kestrel adds Tue 1 Dec as a public holiday on 149's Leave War; Osprey has an overseas duty on 1 Dec that now asks the OIL question. Kestrel's bell gets the line; Hunter, 142's admin with Plan of 149, gets nothing (D2202: "his bell carries that squadron's admin lines, on by default"; D2195: the line goes to "its own squadron's schedulers", and Hunter is one of 149's by D2201). Fix: the holiday's audience is the squadron's admins at home plus the non-master admins holding Plan of it (the one `adminsOf` body of plan §6.2 step 6) — and plan A4's "tells its own schedulers only" must say so, with the gate's 7e letting the line reach him once A4 removes the holiday's crossing exemption (perms helper). |
| 27 | leavewar/sync.ts:1434–1442; state/notices.ts:614, 763 | `holidayLeft` (through `noticeLeft`) | how many inputs a holiday line still counts — a line counting 0 is not shown | counted for the READER's home squadron | MISSING | Once row 26 writes 149's holiday line to Hunter, `holidayLeft(…, Hunter)` counts 142's inputs on 1 Dec — none — so `noticeLive` hides the line and his bell never lights for Osprey's question. Fix: count the line's own squadron (the line carries it — D2202's mark of which squadron it is from, not built), never the reader's home; plan §3's "holidayLeft reads the reader's home today on purpose" leaves this out. |
| 28 | ui/OilDayList.tsx:48 (outside my file list — found through `oilOpenOn`, leavewar/sync.ts:1405, l.1416) | the OIL list a holiday line opens | whose inputs the list offers to answer | `myUnit()` — the reader's home squadron only | MISSING | Hunter taps the 149 holiday line (rows 26–27 fixed): the OIL list opens on 142's inputs and says "Nothing left to answer"; Osprey's question can only be answered from 149's own admins' bells. Fix: open the list on the line's squadron for a reader who is an admin of it (home admin, Plan holder, master admin), as `pageUnit` will for the other pages. |
| 29 | leavewar/sync.ts:1476–1486 | `tellHoliday` | the OIL list opens by itself for the admin who made the holiday, on his own squadron's inputs | the maker — only someone with that war loaded, i.e. at home in it | HAS IT | — |
| 30 | leavewar/sync.ts:1282–1296 (on screen: ui/HolidaysPanel.tsx:341) | `holidayOutOfDate` | which squadrons' published days the Holidays form warns are put out of date | the form's own squadron, and every other squadron at the same place on those dates | WRONG | Hunter adds Tue 1 Dec on 142's Holidays list where 149 shares the place: the warning also names 149's published 1 Dec — 149's business, shown to an admin with no Plan of 149 (D2195: "the Holidays form's warning names only its own squadron's published days"). Fix: already planned — reshape plan A4 (`holidayOutOfDate` gives only the war's own squadron's days). |
| 31 | leavewar/sync.ts:1462 → 2858–2863 | `ownSchedulerIds` → `runPoOutcomes`' tellers | who gets "Osprey · Posted out · archived, account suspended" when a posting runs | admins at home in the war's squadron (switched on, tied); a master admin through his home only (D2198 — right) | MISSING | Osprey's posting out (Overseas Sqn) runs on its date on 149's war: Kestrel's bell gets the line; Hunter, 142's admin with Plan of 149, gets none (D2202). Fix: already planned — plan §6.2 step 6, `adminsOf(149, today)` = home admins and non-master Plan holders, the pass's gate reading the same set. |
| 32 | leavewar/sync.ts:1623–1645 | `postedLines` | the "off the manpower" line each admin's bell works out | `ownSchedulerIds` — home admins of the LOADED war only, from the loaded war's postings | MISSING | Osprey's posting with no outcome reaches its date: Kestrel's bell shows "Osprey · Posted out · off the manpower"; Hunter's does not — and his page loads 142's war, so the line could not be worked out for him even if he were in the set. Fix: the set is planned (§6.2 step 6, "read the same set"); reading 149's stored postings for a reader whose page holds 142's war is not — work it out from the posting's own squadron's stored war, or write it as the pass does. |
| 33 | leavewar/sync.ts:3288–3319 (l.3316, l.3317) | `postingLinesOf` | which posting lines "Undo post out" takes back | stored lines only where the reader is at home in the war's squadron today (`atWarHome(n.to)`, l.3316); worked-out lines through `ownSchedulerIds` (l.3317) | MISSING | Once row 31 tells Hunter of Osprey's posting, Kestrel presses "Undo post out": `atWarHome(Hunter)` is false, so Hunter's line is not in the list — it stays on his bell, unstruck, saying Osprey was posted out. Fix: the stored lines' filter reads `adminsOf(the war's squadron, today)` or a line about him, never `atWarHome`; plan §6.2 step 6 names l.3317 only — l.3316 is not in it. |
| 34 | leavewar/sync.ts:3325–3341 (l.3328, l.3332) | `retractPostingLines` | which lines are removed, and who gets "~~Posted out~~ · taken back · Kestrel" | readers at home in the war's squadron today (l.3332), still holding the admin role (l.3328, any squadron) | MISSING | Same case: Hunter had read Osprey's line; Kestrel's Undo skips him at l.3332 — his line is neither removed nor struck "taken back". Fix: the same set as row 33 at l.3332 (the gate's 7e must then let Kestrel's command touch a line on Hunter's bell — perms helper). Not in the plan. |
| 35 | leavewar/sync.ts:1467, 1559–1569 | `atWarHome` in `tellWar` | a decision on a man's own leave told to him | the man, while at home in the war's squadron (his own leave stays in his primary, D1695) | HAS IT | — |
| 36 | leavewar/sync.ts:1572–1584, 1598–1615 | `warAudience`, `tellBidding`, `endedLines` | "Bidding open / closed" lines | every person on the war with a sign-in, at home in its squadron | HAS IT | — (see unsure 1) |
| 37 | leavewar/sync.ts:1681–1707 (l.1690), 1858–1872 | `followUpsFor`, `warNoticesReversed` | who gets "taken back" / "again" after an Undo or Redo of a war line | a line about him wherever he is (D2222); the war's own business only while at home and not moved since (D2218) | HAS IT | — |
| 38 | leavewar/sync.ts:1357–1391 (l.1380) | `oilPendingFor` → `filedByHim` | whether a filer is asked the OIL question of a shared input he filed | the filer while `mayEditInput` (perms) lets him change it | HAS IT | — (the rule is perms' `mayChangeInput`) |
| 39 | leavewar/sync.ts:786–800 (l.791) | `askFiledOil` | a scheduler gets the one OIL list after a filing over several men | `canEditSched()` — the admin role in force, on the war loaded (his home's) | HAS IT | — |
| 40 | leavewar/sync.ts:2674 (used l.2770, l.2870) | `tellOnce` | a posting's held reason, or "You have been deleted…", said as a passing note | whoever is signed in with that war loaded, member included | HAS IT | — (not a Plan matter) |
| 41 | leavewar/sync.ts:2709–2722, 2979–2990, 3168–3172 | `poHeldReason`, `deleteBlocked`, `archiveLockWords` (all through `accounts.ts lastAdminLock` → `postingLock`) | a posting, Delete or Archive waits while it would leave his squadron with no admin who can sign in | counts home admins only; a Plan holder never counts | MUST NOT, because plan §5.2 / D2242 — a Plan holder counts only where the squadron has no admin at home | — (the no-home-admin case is `accounts.ts postingLock`'s — unsure 6) |
| 42 | leavewar/sync.ts:2905–2921 | `foreignHome`, `foreignOf` | the war half of Archive, Restore, Restore as and Delete for a man of another squadron goes to his own squadron's stored war | reached only through rows 43–47 | HAS IT | — |
| 43 | leavewar/sync.ts:3001–3019 (l.3008), 3057–3062 | `restoreArchivedPerson` (the posting sheet's Undo post out path), `restoreBody` | Undo post out of a posting's own archive | `mayManageRoster()` — the admin role in force; a man of another squadron is refused without a post-in date (l.3062), so only the war loaded's men | HAS IT | — |
| 44 | leavewar/sync.ts:3023–3042, 3112–3125 | `restoreProblem`, `restoreArchivedAs` | Restore on Admin → Users | the admin role in force, then `otherSquadronPersonProblem` (levelOfAccount: master admin, home admin, Plan holder of the man's squadron) | HAS IT | — |
| 45 | leavewar/sync.ts:3025–3027, 3114–3116, 3152–3154, 3396 | `masterChangeProblem` in Restore, Restore as, Archive and an Overseas Sqn posting | a master admin's person is a master admin's alone | master admins only — a Plan holder and a home admin are kept out | MUST NOT, because D2205 | — |
| 46 | leavewar/sync.ts:3150–3165 | `archiveProblem` | Archive on Admin → Users | the admin role in force, then `otherSquadronPersonProblem` (master, home admin, Plan holder); never himself | HAS IT | — |
| 47 | leavewar/sync.ts:3390–3406 | `postOutProblem` | a posting set on another squadron's man; a Delete posting of a master admin | `otherSquadronPersonProblem` (master, home admin, Plan holder); nobody deletes a master admin | HAS IT | — |
| 48 | leavewar/state/store.ts:1124–1131, 1133–1150 | `worldUnit`, `initStore(unit)` | the store holds one squadron's war; the other's records are not in it | neutral | HAS IT | — |
| 49 | leavewar/state/store.ts:2967 (set by state/store.ts:480, 530); every `state.role !== 'admin'` door (l.2099, 2288, 2364, 2630–2841, 4078, 4341, 4414–4432, 4525–5075, 5160, 5270, 5315, 5350, 5492–5793, 5939, 5973, 6099, 6318, 6493) | the war store's admin doors | decide, place, move, OIL awards, credits, events, holidays, grades, balances, settings | the admin role in force, on the war loaded — always his home's | HAS IT | — |
| 50 | leavewar/state/store.ts:3180–3283 | `decisionTells`, `tellDecisions` | a decision on a man's leave told to him | the man whose leave changed, never the actor | HAS IT | — |
| 51 | leavewar/state/store.ts:3114–3118, 3308–3314 | `tellHolidays`, `tellOpenings` | what a holiday or an opening tells — the audience is the sync's (rows 25–26, 36) | neutral | HAS IT | — |
| 52 | leavewar/engine/access.ts:35, 51, 57 | `canEditCell`, `canEditRow`, `canDecide` | an admin writes any day and any row and decides; a member his own row on open days | role `'admin'` of the war loaded (his home's) | HAS IT | — |
| 53 | leavewar/state/foreign.ts (whole file) | the second store for another squadron's stored war | no door of its own; its ids carry the unit so the gate's §7 asks whether the actor is an admin of THAT squadron | decided by rows 43–47 and the gate (perms) | HAS IT | — |
| 54 | leavewar/LeaveWarPage.tsx:146; leavewar/state/daypanel.ts:72; every `role === 'admin'` / `canDecide(role)` / `canEditRow(role, viewer, …)` in leavewar/ui/ (about 70 places in 30 files; all read `getState().role`) | the Leave War's controls drawn or hidden | which buttons an admin sees | the war store's role (row 49) | HAS IT | — |
| 55 | tracker/storage.js:52–72; boot.ts:90 | `bindStorageUnit`, `markStorageLoaded` | whose Tracker the page reads and writes: the signed-in person's home, fixed once loaded | everyone his own; no pick for a master admin or a Plan holder (D2197, D2241 come with the menu) | HAS IT | — |
| 56 | tracker/peoplewire.ts:104–107 → tracker/role.js:34 → tracker/app/core.js:4502, 540–541 | `trackerAdminForTracker`, `mayChangeFlex`, `trk.flex` | the flex settings are an admin's (D1014) | the admin role in force, on his own Tracker | HAS IT | — |
| 57 | tracker/app/core.js:535–537 | `cmdDefinePermission(c, cmdAnyone)` | every other Tracker record is everyone's (D121) | anyone signed in, on his own Tracker | HAS IT | — |
| 58 | tracker/peoplewire.ts:121–123 | the Tracker's people | its + Add offers the bound squadron's roster | the bound squadron's people | HAS IT | — |

## Unsure

1. **Bidding lines (row 36).** I read "that squadron's admin lines" (D2202) as the lines an admin gets because he is one — holiday OIL
   lines and posting lines — not "Bidding open", which every person on the war gets as one of its people. If he means every line 149's
   admins get, a Plan holder would also need 149's bidding lines; today he gets none.
2. **Plan taken away without a move (row 10).** D2202 says "while an admin holds Plan". Nothing takes a squadron's lines off his bell when
   his Plan is removed; only a move does. No ruling says whether they should go. Today no such line exists, because rows 26 and 31 write
   none.
3. **D2203 is not built (row 9).** A move does not clear grants today (`units.ts setHome` — not my files), so `adminThen` keeps a moved
   filer's line through a Plan grant held before the move day. `adminThen` reads the grants correctly; the fault is the grant surviving
   the move, which plan §4.5 owns.
4. **A master admin as a filer (rows 1–2).** A master admin who filed an input for a 149 man is always told of its changes (`adminThen`
   answers yes for the master mark everywhere). D2223 says the filer is told "while he is still that man's admin", and D2198 says his other
   squadrons' lines are off by default. I took filer lines as lines about his own act, not squadron lines, so HAS IT; he may read D2198
   wider.
5. **The gate would refuse rows 26, 33 and 34's fixes as they stand.** `perms.ts` 7e (l.2145–2158) lets an admin's command write a bell
   line only to people of a squadron he is admin of, judged by the reader's home. Kestrel's holiday command writing to Hunter (home 142),
   or Kestrel's Undo post out touching Hunter's line, would be refused once plan A4 removes the holiday line's crossing exemption. The
   posting pass has its own gate, which plan §6.2 step 7 changes; the holiday line and the posting take-back do not. For the perms
   helper.
6. **The last-admin count where the squadron has no admin at home (row 41).** `accounts.ts postingLock` only locks where the squadron had
   an admin at home before (`has(ACCOUNTS_LIST) && !has(list)`), so a squadron whose only admin is a Plan holder is never protected:
   Hunter, the only admin of 150 by Plan, can be posted out of 142 with Overseas Sqn and 150 is left with none. Plan §5.2's rule ("keeps
   an admin at home or a non-master admin Plan holder") covers it once built. This is the accounts helper's row; noted here because
   `poHeldReason` reads it.
7. **D2202's squadron mark.** No bell line carries the squadron it is from, so row 27's count and row 28's list have nothing to read but
   the reader's home. The mark is filed as not built ([MULTI-SQN-DESIGN]); rows 27–28 need it, or a stored squadron on the line.
8. **Code comments naming the master admin alone** where a Plan holder acts too — not on screen, so not WORDS: `leavewar/sync.ts` l.2906
   ("the master acting on another squadron's man"); `leavewar/state/store.ts` l.1163, l.2247; `leavewar/state/foreign.ts` l.5–7;
   `state/changelines.ts` l.324, l.671. A wording fix for the next agent, if wanted.
9. **The posting sheet's Undo post out of a master admin's own posting** (row 43): `restoreArchivedPerson` without a post-in date asks no
   `masterChangeProblem`, though `enableAfterPosting` turns a master's account back on. The gate (perms) probably refuses it as "That did
   not save". Not a Plan matter; not checked.

## Not read

- `leavewar/sync.ts` (4,069 lines): read whole l.270–370, 780–800, 1278–1310, 1355–1880, 2095–2150, 2172–2182, 2478–2510, 2690–3550;
  the rest only through searches for role, admin, master, level, grant, home, unit, `me()`, `SESSION`, `mayEdit*`, `mayManage*`,
  `canEditSched` and the notice writers. The unread spans are the OIL pass, the flying plan's reads and the absence index — the
  searches found no who-check there.
- `leavewar/state/store.ts` (6,505 lines): searches only, plus l.1120–1170, 2240–2255, 2960–2985, 3110–3335. Its doors were checked
  only for what they ask (`state.role`, `canEditRow`, `canDecide`), not one by one.
- `leavewar/ui/`: searches only; confirmed every role check reads the war store's `role` and that nothing there reads a squadron,
  a level or the master mark. Controls were not listed one by one.
- `tracker/components/*.jsx` and the rest of `tracker/app/core.js`: searches only (no role read besides `mayChangeFlex`).
- Outside my files and not judged: `ui/topstate.ts` and `ui/topbits.tsx` (the bell's tap and list), `engine/editlog.ts` (who reads
  which squadron's history), `state/sched-commit.ts` (calls `noticePass`; no audience of its own), and every `perms.ts` gate the
  rows above lean on.
