# Phase 3's helpers — each helper's items (chat 130, 21 Nov 26)

Drafted by chat 130 for the reshape plan §10's phase 3. **How every helper works is the phase-2 brief's common section,
word for word** — `raptor-port/docs/superpowers/briefs/2026-11-21-msq-reshape-phase2-helpers.md` §How every phase-2
helper works (your copy, read first, your files only, red first, words and looks, not findings, checks, shell traps,
commits, stop and report) — with these changes: your branch is `claude/msq-b1-<BRANCHNAME>` cut from BASECOMMIT, the tip
of `claude/multi-sqn-b1-107` when you start (it carries phase 3's contract step: the "whose is he on a day" readers —
`homeOn`, `homeUnitOf`, `onRosterOf`, `rosterOf`, `unitPeople`, `myUnit`, `levelIn`, `levelOfAccount` — take no default
day, and in tests and development builds they throw on a missing or malformed one, engine/roster.ts `needDay`; write the
day you mean, `todayIso()` / `rosterToday()` on purpose or the day you draw). The plan's §12: all his questions are
answered (D2239–D2243, D2245–D2250, D2252, D2253) — build as answered. **No known red test** on BASECOMMIT: report any.

**Shared, not yours:** `src/test-support/msq-world.ts` — add a harness beside it if you need one. The host builds, at
the same time, the guest view's removal (D2239: `ui/GuestApp.tsx`, the Admin switch, the waiting screen's button, the
guest role's cells in `state/perms.ts`), `perms.ts stampForged` (R6 of the 35) and `perms.ts pickStandsOn`; do not touch
those.

## ITEMS — helper "holidays" (branch `holidays`) — A4 with PB3, PB4, PB5, R3, R4 (the core's lines, built by you)
You are the core builder for these lines only (the plan §10's phase 3 "core … A4"). Read: the plan §7 A4, §19 (PB3,
PB4, PB5), §19b (R3, R4); the rulings D2195 (each squadron owns its own holiday list — never shared, even at one place),
D2207 (the warning's words), D2202 (a Plan holder's bell carries that squadron's admin lines), D2201, D2241; the OIL page
`.claude/rules/decisions/oil.md`, the Leave War page and People & accounts. Your files: `leavewar/state/store.ts` (the
place-holiday overlay), `leavewar/sync.ts` (the holiday and OIL-list code), `state/notices.ts` (the holiday line's
functions only — `noticeHoliday`, `holOf`, `noticeSpan`, `noticeLeft`, `holidayLineOn`, `holidayLineAny`, the supersede
step), `state/perms.ts` (7e's holiday-line exemption and the gate's holiday-line probes only), `ui/oilday.ts`,
`ui/OilDayList.tsx`, `ui/pops.ts` (`OILLIST` only), `ui/HolidaysPanel.tsx` (only where the warning's line needs it),
`state/flyplan.ts`, `state/flyplan-model.ts`, their tests. In this order, each its own commit:
1. **A4** (§7): remove `setPlaceHolidays`, `withPlaceHolidays`, `PLACE_PH`/`PLACE_VER`, `placeHolidaysFor`,
   `ownPublicHolidays`, `PLACE_CACHE`; `nonWorkingFor(unit, iso)` reads only that squadron's own list; `holidayOutOfDate`
   gives only the war's own squadron's days; `oilOpenOn` → `oilAskPlan` → `isNonWorkingISO` judges each squadron's input
   by its own squadron's holidays (the call site Opus A says is easy to miss); `ui/oilday.ts outOfDateSaid` takes D2207's
   words exactly — "Already published as working days: Wed 15 Jul and Thu 16 Jul. Publish them again so the crew on them
   earn OIL for the holiday." / one day: "Already published as a working day: Wed 15 Jul. Publish it again so the crew on
   it earn OIL for the holiday." — in the warning line's existing green (M6), no squadron number; rewrite
   `leavewar/holidays-by-place.test.ts`'s first case to D2195 (name it in your report). Proofs `a-a04-holiday-reaches-other-sqn`
   and `a-a04b-holiday-bell-other-sqn`, red first.
2. **PB3** (audience): `holidayTodo` tells `adminsOf(the squadron whose input asks, today)` — its own admins and a plain
   admin holding Plan of it — never another squadron's; then **in `perms.ts` 7e remove the holiday line's crossing
   exemption** (the skip for a minted, owed holiday line): the line now takes the ordinary checks, which pass an admin's
   line to his own squadron's people and to a reader in `adminsOf` of a squadron he is an admin of (PC1, built). If the
   owed-line probes (`HOL_OWED`, `holMade`, `holidayLinesOwed`, `holidayLineCovered`) are left with no reader, remove them
   with their tests rewritten to the outcome, named.
3. **PB4 + R3** (the line carries its squadron): a holiday line stores the squadron it was written for (on its part, as
   `fu` is on an input's); `holidayLeft` counts that squadron; `OilDayList` opens on it for any admin of it — at home, by
   Plan, or a master admin; `OILLIST` carries the list's squadron through `Body` to `saveOilDay`, whose door asks "admin
   of that squadron" with the role in force; the window's identity carries it; `tellHoliday` reads the line's squadron.
4. **R4 + PB5**: a line's span, name, duplicate check and footer read its own squadron (its stored war when not loaded,
   `nonWorkingFor(unit, d)`); a line supersedes only lines of the same squadron; `holidayLineAny` compares the line's
   squadron with the list's, not the reader's rights.
5. **The flying plan's `dayFacts`** (`flyAnswer`, `flyMonth`): the page's squadron's holidays (`nonWorkingFor(unit, iso)`
   or that squadron's own facts), never the loaded war's.
Proofs for 2–5: the cases naming PB3, PB4, PB5 in `…/2026-11-20-msq-plan-audit-repro/p-plan-audit.test.ts.txt` and O4 in
`o-opus-plan-audit-read.test.ts.txt`; where a finding has none, write its case red first (Hunter, 142's admin with Plan of
149, through the real doors). Nothing new on screen except D2207's words.

## ITEMS — helper "session", phase 3 (branch `session3`)
Read: the plan §3.2 A-iv and A-v, §3.4 (`enterSquadron`'s rows), §11 (A2's band, A2), §14 item 3, §19b R6; D2243 Q7; the
drawing `raptor-port/docs/mock/2026-11-20-multi-sqn-reshape/page.html` §7 with pictures `img/q7a`–`q7e` (`-d` desktop,
`-p` iPhone). Your files: `state/store.ts`, `state/typing-hold.ts` (new), `leavewar/ui/Sheet.tsx`,
`tracker/components/Pop.jsx`, `tracker/components/Modals.jsx`, `tracker/storage.js`, `tracker/TrackerPage.tsx`,
`boot.ts`, the stylesheet that holds the failed-save band's look (name it), their tests. In this order:
1. **The midnight swap switched on** (A-iv; built in phase 2 with its trigger off): `notify()` calls `enterSquadron` when
   the signed-in person's home today differs from his home at entry. A2's proof `a-a02-signed-in-across-move` red first,
   driven by the clock (`pastMidnight()`), never by calling `notify()` itself; §3.4's `enterSquadron` rows and A-v's
   "across the midnight swap" Undo tests, red first where they fail today.
2. **The hold and the band** (A-iv "Typed work at the swap", D2243 Q7, built to the approved drawing, D1478): an open
   Leave War window or Tracker edit pop-up holds the swap of that page (`state/typing-hold.ts` asks `Sheet.tsx`'s open
   windows and the Tracker's pop-ups); the window stays, its typed words visible, with one band across its top in the
   look the app already uses for a save that failed, the words "You are 149's from today. This can't be saved in 142's
   Leave War." (Tracker: "…in 142's Tracker."), the numbers being the squadrons', and one button, "Close", which closes it
   and lets the swap run (opening 149's Leave War); nothing saved into either squadron; a save the old squadron refuses
   after midnight is named in the same band. On the iPhone the band takes two lines. The drawing check (D1494) at
   1536×864 and 402 wide, every difference over about 2px listed with marked pictures side by side; differences fixed
   or named in your report. If the Tracker cannot be re-read in place (§14 item 3, found in phase 2), say exactly what
   happens to its pop-up at midnight and what the band says then — never a guess.
3. **R6 of the blind read** (dormant until P1/P3): `notify()` re-enters when `pageUnit('own', today)` differs from the
   loaded war's or Tracker's squadron, or the pick has no readable right behind it (`perms.ts pickStandsOn(iso)`, the
   host's), with the hold as at midnight. Its tests drive `switchUnit` and a right's end directly.
