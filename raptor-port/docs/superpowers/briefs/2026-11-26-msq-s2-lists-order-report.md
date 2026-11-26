# Section 2 — every list of squadrons in the one order: the builder's report (26 Nov 26)

His ruling D2730 Q1: in every list of squadrons, the signed-in person's home squadron (his home that day) stands first,
then the rest by number. The one order was written in `src/state/units-model.ts` (`squadronOrder` / `bySquadronOrder`);
this step re-points the section's lists at it. Nothing committed, staged or pushed; no build run; no checks lock taken.

Status: READY FOR INDEPENDENT REVIEW

## How "his home" is read

One new pair in `src/state/perms.ts`, beside `myUnit`:
- `myHomeOn(iso = today)` — `homeOn(me(), iso)`, the way every page reads it; `null` when nobody is signed in, the person
  is waiting, or has no home. Unlike `myUnit` it never falls back to the boot squadron (that would stand first a
  squadron that is nobody's home).
- `inSquadronOrder(ids, iso = today)` — `squadronOrder(ids, myHomeOn(iso), id => id, number from the store)`. Every list
  of squadron ids below calls this; no list keeps a sort of its own.

## Each list

| List (what a person sees) | Where its sort was | What it calls now | Its test (in `src/ui/msq-s2-lists.test.tsx`) | Failed before at |
|---|---|---|---|---|
| Schedules menu and ☰ menu's squadron rows | `perms.ts readableUnits` — its own `localeCompare` sort (menuSquadrons maps readableUnits; the menu components sort nothing, untouched) | `inSquadronOrder(out, iso)` | "the Schedules menu and the ☰ menu …" › kestrel / mako / saber | line 65 (kestrel, mako) — got 142, 149, 150 |
| Admin → Squadrons' rows | `squadrons-model.ts squadronRows` — `byNum` | `squadronOrder(units(), myHomeOn(iso), …)` | "Admin → Squadrons …" › kestrel / mako / saber | line 76 |
| Admin → Squadrons, each place's grey line ("142 · 149 · Perth …") — found, same file | `squadrons-model.ts placeRows` — `byNum` | `inSquadronOrder(unitsAtPlace(…), iso)` | same tests, "the place's squadrons" | line 79 (checked by putting the old sort back on that line alone) |
| Admin → Users, Filter's Squadron ticks | `UsersFilter.tsx` — `byNum` imported from `useraccess-model` | `inSquadronOrder(units() ids)` | "Admin → Users: the Filter's Squadron ticks …" › kestrel / mako | line 91 |
| Admin → Users, grouped headings when squadrons are ticked | `usersfilter-model.ts usersView` — its own `byNum`, twice (`inView`, `units_`) | `inSquadronOrder(…, iso)` both | same tests, "the group headings" | line 93 (checked by putting the old sort back on `units_` alone) |
| Add a person's "Home squadron" choices, after the page's own — found, same file | `usersfilter-model.ts addHomeChoices` — its own `byNum` | `inSquadronOrder(…)`; the page's own squadron still first, as drawn (b1-7) | "Add a person's 'Home squadron' …" › Kestrel on 150's page / Mako on 142's page / Saber | lines 101, 105 |
| An opened row's squadron lines | `UserAccess.tsx SquadronLines` — `byNum` from `useraccess-model` | `inSquadronOrder(units() ids)` — the signed-in person's home; the opened man's home still only marks his "Home squadron" line | "an opened row's squadron lines …" › Kestrel opens Osprey | line 119 |

The Saber cases (home 142, the lowest) passed before and after — nothing changes for him. Test world: `withThird()`;
each test makes Kestrel (149) and Mako (150) master admins through Saber's real door, so each reads every squadron, sees
the Squadrons page and the Filter's Squadron ticks.

## Every caller of the exported `byNum` (`useraccess-model.ts`) and what became of it

- `useraccess-model.ts alsoPlansOf` ("· also plans 149, 150") — kept BY NUMBER, on purpose: numbers inside a sentence,
  as the `state/units.ts` sentence you named stays by number. It now calls `squadronOrder(…, null, …)` (the one order
  with no home = by number), not a copy. It also already leaves the opened man's own home out. **Unclear — your call:**
  if "also plans" counts as a list of squadrons under D2730, change `null` to `myHomeOn(iso)`.
- `UsersFilter.tsx` — re-pointed (above).
- `UserAccess.tsx` — re-pointed (above).
- `UsersPanel.tsx` — never imported `byNum`; it does no squadron sorting of its own. **Not touched.**
- `byNum` export removed; `usersfilter-model.ts`'s own `byNum` removed. `squadrons-model.ts` keeps its local `byNum`
  only for `firstAdminChoices` (below).

## Pins re-pointed (by name, to the new rule)

- `src/ui/msq-sqn-menu.test.tsx` — "Kestrel, 149's admin, with View of 142: 142 'View only', 149 'Your squadron' — in the
  store's order" truly pinned by number for a man of home 149. Re-pointed by name to "…: 149 'Your squadron' first, then
  142 'View only' — his home first (D2730 Q1)", expecting `['149 Your squadron', '142 View only']`, a comment saying why.
- No other pin needed changing: every by-number pin in `msq-s2-asis`, `msq-users-filter`, `msq-squadrons-panel`,
  `msq-users-row` etc. is for Saber or Hunter (home 142) or a one-squadron list, so it holds as is.
  (`msq-s2-asis` "Kestrel is not offered 142 at all" — a one-row list, unchanged.)

## Test files run (one at a time, `npx vitest run <file>` from `raptor-port/`)

Every test file naming a changed function, file or a menu/panel that reads them — 73 files. All pass:
corelines-sign-tick 5 · roster-readers 3 · msq-bell-rights 14 · msq-undo-a7-line 3 · multi-sqn-fixread10 29 · 11 46 ·
12 37 · 13 31 · 14 13 · 15 7 · 16 13 · 17 4 · fixread3-undo-moved 3 · fixread4-bells 20 · fixread6-allavail 9 ·
fixread6-followups 11 · fixread6-retired 12 · fixread7 23 · fixread8 22 · fixread9 26 · archive-ends-rights 5 · docs 14 ·
edit-rights-readers 4 · lastadmin 24 · msq-fix2-undo-jam-plan-lost 2 · msq-fix2-undo-last-admin-words 1 ·
msq-s2-order 14 · msq-s2-plan 4 · msq-undo-rights 11 · multi-sqn-job2-inputs 6 · multi-sqn-job2-lock 4 · perms-scan 2 ·
pick-stands 4 · piece-b-tables 25 · reshape-piece-c-doors 20 · reshape-plan-audit 9 · reshape-r2-move-back 3 ·
reshape-r4-no-old-right 4 · reshape-r6-reenter 6 · reshape-r6-refusal-stamps 5 · save-access 29 · units-model-dated 12 ·
units-place 12 · units-sqn-fixread 14 · units-sqn-fixread16 7 · units-sqn-fixread2 34 · units-sqn-guard 17 · units 22 ·
msq-trk-pick-ask 20 · drawer-keys 2 · drawerlock 3 · escwindows 24 · msq-bell-tap 12 · msq-fix2-users-moved-admin 1 ·
msq-fix3-drawer-edit 3 · msq-fix3-users-one-save 3 · msq-guard-asis 29 + 4 todo · msq-guard-open 174 ·
msq-pick-windows 22 · msq-s2-asis 24 · **msq-s2-lists 14 (new)** · msq-s2-rejudge 23 · msq-s2-row 15 ·
**msq-sqn-menu 13 (1 failed before its re-point, 13 after)** · msq-squadrons-panel 17 · msq-users-filter 24 ·
msq-users-row 7 · msq-view-only-menu 22 · pops 4 · postout-landing 4 · reshape-b2-no-guest-switch 3 · rolestable 12 ·
schedule-insights-menu 14.

NOT RUN, as briefed: the full unit suite, `npm run build` (the real type check here), the browser tests, React Doctor's
`lint:changed`, any walk. `npm run docsize`: passes.

## Records touched

- `docs/file-map.md` — a "Chat 205" entry for the changed files and the new test (the chat number is my guess from the
  branch's last commit — correct it if wrong).
- `docs/ui-contracts.md` — three lines that said "by number" now say his home first then by number: the Schedules menu
  (§ near line 205), Admin → Squadrons' rows (near 276), an opened row's squadron lines (near 7187). Left by number:
  the access screen's list (near 302) and the bell's chips (near 5277 — the bell chat's).

## Lists found and left, with why

- `squadrons-model.ts firstAdminChoices` ("+ New squadron"'s first admin, "Hunter · 142") — a list of PEOPLE ordered by
  their squadron's number then callsign, not a list of squadrons. Left by number. **Unclear — your call** whether
  D2730 should also put the signed-in admin's home squadron's admins first.
- `state/bellsqn.ts` (the bell's Show row) and Admin → Display's list — another chat's, as briefed. Note:
  `bellsqn.ts` keeps its own sort and does not read `readableUnits`, so this step does not change the bell.
- `ui/AccessScreen.tsx` near line 153 — the access screen's list; nobody signed in: by number, as briefed.
- `state/units.ts` near line 328 — the sentence of numbers; by number, as briefed.
- Outside this section's files I found no other squadron sort: `SquadronMenu.tsx`, `Drawer.tsx`, `topbits.tsx`, `Shell.tsx`
  draw `menuSquadrons()` as they get it.

## What a person sees differently

Only the order of squadrons, and only for someone whose home is not the lowest number (149's or 150's people today):
- the Schedules menu ("149 ▾") and the ☰ menu's squadron list: his own squadron at the top, then the rest by number;
- Admin → Squadrons: his own squadron's row first, and each place's grey line naming his squadron first
  ("149 · 142 · Home base · GMT+8");
- Admin → Users: the Filter's Squadron ticks, the headings when several squadrons are ticked, an opened person's
  squadron lines, and Add a person's "Home squadron" choices after the page's own squadron — his own first, then by
  number.

Nothing changes for anyone at home in 142, or with nobody signed in. No words, sizes or looks change.

## Open items

- The two "your call" points above (`alsoPlansOf`, `firstAdminChoices`).
- The readers owed (a fresh Opus read; Astra's) and the build's type check — not mine to run.
