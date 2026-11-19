# Batch 1's remaining pieces — which files each touches, and what can run side by side (19 Nov 26, chat 111)

A read-only map made by a helper of chat 111 (code and docs read, nothing changed), for offering him parallel
sessions on `claude/multi-sqn-b1-107` once [MSQ-FIXREAD4-OPEN] claims 1–4 are fixed and checked. Not yet checked by
the host line by line — each session re-checks its own piece's files before it starts. Paths under `raptor-port/`.

## The pieces
1. **P1 — the access row on Admin → Users** (None · View 149 · Plan 149 · Master admin; "· also plans 149") —
   D2192, D2199, D2201, D2217 Q1–Q3. Partly built: the 'admin' grant level exists with full rights
   (`state/units-model.ts levelFrom`); gaps — `setGrant` and the gate (`perms.ts` §6) let any admin give it, where
   D2199 says a master only, and only to someone an admin at home; `ui/UsersPanel.tsx` has no squadron row or list by
   squadron. Drawn (pictures 1a–1c, 2a–2b).
2. **P2 — Admin → Squadrons, "+ New squadron" with its place, a shared place's time zone for a master only** —
   D2196, D2217 Q12. Commands exist (`state/units.ts addUnit`, `setPlace`); no page; the gate still lets an admin of
   a unit at the place change the time zone. Drawn (picture 7).
3. **P3 — the "149 ▾" Schedules menu, every page following a master's pick** — D2197 (base D2132). Not built:
   `switchUnit` (`state/store.ts`) is called by nothing on screen; the Leave War and the Tracker hold one squadron
   per sign-in (`leavewar/sync.ts swapWarWorld`, `tracker/storage.js`). Drawn (round 3).
4. **P4 — the master's bell: Show 142 / 149, primary on by default, a grey squadron badge** — D2198, D2202, D2217
   Q4/Q5. Not built: a bell line carries no squadron (`state/notices.ts`); the per-squadron switch is a new saved
   setting. Drawn (pictures 3a–3c).
5. **P5 — each squadron's own public-holiday list** — D2195, D2207 (no "142's" in the warning), D2206 H1 (holiday
   OIL by one's own list). Step 4 lays one squadron's list on every squadron at a place and `tellHoliday` tells
   them all — both to undo. The detachment's "Copy 149's list" (D2204, Q6) waits for batch 2 (no detachments yet).
6. **P6 — sign-in held while the last person's save waits** — D2205 M2, Q7. Not built (`ui/logout.ts` already holds
   the reload; the sign-in side has nothing). Drawn (picture 5).
7. **P7 — a move clears every View and Plan** (D2203) — already built (`state/units.ts setHome`, pinned by
   `state/units-sqn-fixread2.test.ts`); its "Plan ended" bell line is part of P9.
8. **P8 — the amber "posting could not run" line, its bell line, the dated last-admin refusal** — D2214, D2217
   Q13/Q15. Not built. Drawn (pictures 8, 9b, 10).
9. **P9 — new cross-squadron bell lines.** D2219 waits for batch 3 (borrowing). D2220's buildable part now: Plan
   given or removed, View given (Fable cases 21–22), a shared place's time zone changed or a squadron leaving it
   (29–30) — **not drawn yet; drawn for him first** (D1625). The rest of D2220 waits for batches 2–4.
10. **D2221** (a move's effect on an old-squadron posting and on leave across it) — nothing to build until batch 4.

## Files each touches (main tests in brackets)
- **P1:** `ui/UsersPanel.tsx`, `state/accounts.ts`, `state/units.ts`, `state/perms.ts` §6/§8 (`units-model.ts` only
  if the stored level is renamed — not required) [`ui/accounts-ui.test.tsx`, `ui/admin.test.tsx`,
  `state/units.test.ts`, `state/units-sqn-guard.test.ts`, `state/units-sqn-fixread2.test.ts`]
- **P2:** a new Squadrons panel, `ui/AdminPage.tsx`, `state/units.ts`, `state/perms.ts` §6, `ui/scheduler.css`
- **P3:** `ui/Shell.tsx`, a new menu, `state/store.ts`, `engine/unitview.ts`, `state/perms.ts` (myUnit),
  `leavewar/sync.ts`, `tracker/storage.js`, `storage/adapters.ts`, `ui/QualsPage.tsx`, `ui/AdminPage.tsx`,
  `ui/UsersPanel.tsx`
- **P4:** `state/notices.ts`, `state/noticeseen.ts`, `ui/topbits.tsx`, `ui/topstate.ts`, `state/perms.ts`,
  `storage/tables.ts`
- **P5:** `leavewar/sync.ts` (holidays), `leavewar/state/store.ts`, `ui/oilday.ts`, `ui/HolidaysPanel.tsx`,
  `state/perms.ts` (holidayLine)
- **P6:** `ui/Login.tsx`, `ui/logout.ts`, `storage/savewait.ts`, `ui/scheduler.css`
- **P8:** `leavewar/sync.ts` (the posting runner), `state/notices.ts`, `ui/UsersPanel.tsx`, `state/accounts.ts`,
  `state/units.ts`
- **P9:** `state/notices.ts`, `state/units.ts`, `state/perms.ts` (notice crossing rules)
- **Shared documents:** `docs/data-model.md` §11 (any permission change), `docs/data-schema.md`,
  `docs/notifications-register.md`, `docs/file-map.md`, `HANDOFF.md`, `OUTSTANDING.md` — each session writes only its
  own paragraph or rows.

## Grouping
- **Side by side, after claims 1–4:** **A** P6 alone (no shared source file); **B** P5 (shares `leavewar/sync.ts`
  with P3 and P8 and one `perms.ts` line); **C** P1 + P2 together (share `units.ts` and `perms.ts` §6).
- **After them, one at a time:** **D** P3 (after B and C); **E** P4 + P8 + P9 in one bell session (after C, and P9
  drawn and approved first).
- **Waiting on later batches:** D2219, most of D2220, D2204's copy step, D2221.
- **Readers of each session's bug check (D2224):** Astra first, the fresh, blind Opus reader and Fable, each blind to
  the others, on every code read of this build — its FULL read and each fix read after it; the security read too where
  sign-in or permissions change (D1411).
