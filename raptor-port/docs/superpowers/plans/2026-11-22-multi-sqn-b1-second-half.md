# Batch 1's second half — the technical plan (chat 138, 22 Nov 26)

The screens of the multi-squadron build's batch 1: the batch plan §3.6 steps 5–6
(`2026-11-17-multi-sqn-build-batches.md`), the rest-pieces map's P1–P4, P6, P8 (`2026-11-19-multi-sqn-b1-rest-files.md`),
the reshape plan §19's step-5 items (PE1's call sites, PF1/O3, PG1, PK1, R2, R6, R9, R10 —
`2026-11-20-multi-sqn-b1-reshape.md`), and his rulings D2297–D2311 as drawn on the second-half page
(`docs/mock/2026-11-22-msq-b1-screens/page.html`, approved whole — "as recommended for all", 22 Nov 26). **The pictures
are the spec;** D2306's five wordings change the drawn text. Paths are under `raptor-port/src/` unless they start with
`docs/` (= `raptor-port/docs/`) or `.claude/`. What exists today was surveyed by three read-only helpers on
`df1165d42` (22 Nov 26) and spot-checked by the host; each step re-reads its own files before it starts.

## For him, in six lines

1. First, out of sight: every edit button on the schedule pages learns to ask "is he an admin of *this* squadron?" —
   so someone with View only of 149 can never edit 149, the moment the menu appears.
2. Then the "142 ▾" button and its menu, the board's number, and every page following the pick for a master admin or
   a Plan holder.
3. Admin → Users by squadron (the new row, the roles table, the filter button, Home squadron on Add a person), Request
   access asking the squadron, and Admin → Squadrons with "+ New squadron".
4. The bell: squadron buttons and the grey squadron mark, the line when your own account changes, the line when a
   posting could not run; a sign-in that waits for the last person's save.
5. Tested with eight squadrons, walked on your desktop's size and your iPhone's, every picture checked beside the
   approved drawing.
6. Eight small things found while planning and by its three readers need your look before they are built (§9, §15) —
   one picture each, on one page, at the build's start.

## 0. Ground rules

- **Rulings that bind every step:** a scheduler is always an admin (D785). Demo data already stored is not a finding
  (D56). Undo steps back one's own changes only, never cleared as a shortcut (D148); a change made with one press is one
  Undo step — except what D350 keeps out of Undo in this build: adding a person, archive, Restore, delete, a posting
  (red team R-A9). A move counts from the next day (D2119) and ends every View and Plan (D2203). View reaches only the other
  squadron's View-only Sched and Logic, read only (D2252, D2191). Plan is a master admin's to give (D2199) and gives full
  access (D2201, D2211); a master admin's and a Plan holder's every page follows the pick (D2197, D2241). In the member
  view a master admin or Plan holder is a member of his own squadron holding View of what he could edit (D2253). "An
  admin of 149" covers 149's own admins, a Plan holder of it and a master admin (D2299). The right design, not the
  easiest (D754).
- **Engine bodies are verbatim ports;** none changes here. The original's 728 stay 728/0 (`node reference/tfin.js`).
- **Every existing test stays green** except those a ruling of this half rewrites (named in the report, read by the fix
  read, none deleted — the reshape plan §9.3's rule). Each new behaviour is a test run red on today's code first.
- **Every new or changed permission** gets its `PERMS` row and `docs/data-model.md` §11 in the same change; every new
  stored record the undo-contract checklist whole (`commit()`, a `COMMAND_OPS` row, the gate, a row mapper, a `tableOf`
  case — the batch plan §3.4).
- **New words he will see** are the drawn words, with D2306's five changes; words this plan adds that no picture holds
  are listed in §9 and shown to him before they are built (D1625).
- **Tier: FULL** (§8). Readers: Astra, a fresh blind Opus reader, Fable (D2224) and the security reader (D1411), every
  read keeping all its readers (D2236).

## 1. What exists today (the survey, 22 Nov 26)

| Piece | Built | Missing |
|---|---|---|
| The pick | `state/store.ts enterSquadron` (schedule, war, Tracker together), `switchUnit`; `state/perms.ts pageUnit`, `pickStandsOn`, `adminOfPage`, `maySchedEditPage`; R6's re-entry (`entryDue`, dormant: nothing picks) | any caller on screen; `maySchedEditPage` has no caller |
| Edit rights | `mayEditSched` read through `state/auth.ts canEditSched` (175 uses in 37 files) and `lgCanEdit`; `isAdmin()` about 45 uses; `HOOKS.editMode` drives Edit Schedule's drags | all ask the role only — a View holder with 149 picked would be offered 149's edit controls (every save already refused at the gate, §7) |
| Top bar | `ui/topbits.tsx SqnMark` draws `sqnNum('schedule')` | the button and menu |
| Board | `ui/SchedBoard.tsx` l.542–555 day title | the grey number |
| Print, CSV, LoX | already read the unit (`ui/export.ts sqnNum`) | a test pinning 149 picked |
| Admin → Users | one list of all people (`ui/UsersPanel.tsx` l.526); Role `<select>` with the long words; Suspend, Archive, Delete, Give sign-in; doors `setGrant`, `removeGrant`, `setHome`, `setMaster` with their refusals (no screen calls them) | the list by squadron, the row of R1–R5, the roles table, the filter, Home squadron on Add a person; `linkablePeople` not by squadron |
| Request access | `ui/AccessScreen.tsx`; `accessreq:<id>` rows; any admin answers any request; `reqseen:<account>` | the squadron on the request and its audience |
| Admin → Squadrons | `state/units.ts addUnit` (first admin given Plan, `first:true`), `setPlace`, `moveUnit`; `units-model.ts gmtLabel`, `validTz`; master-only `unit.add` | the panel; a new place inside "+ New squadron"; D2196's shared-place time zone at the gate (PG1) |
| The bell | line kinds in `state/notices.ts` (only the holiday's carries its squadron, `u`); `noticeLeftBell` judges a move; `noticeseen:<pid>` | a squadron on every line, the squadron buttons and grey mark, D2310's at-once leaving, own-account lines, the posting-failed line |
| Approvals "New" | `state/apprseen.ts`, `apprseen:<pid>`, a community key | one per squadron (R2) |
| Sign-in wait | `ui/logout.ts` holds the reload; `storage/savewait.ts saveWaiting`, `onSavesLanded` | `ui/Login.tsx` never waits |
| Tests | `test-support/msq-world.ts useMsqWorld` — 142 and 149, five named sign-ins | more squadrons; no cap in the store (`addUnit` has none) |

## 2. Step A — edit rights follow the squadron (no screen change; first)

The menu makes another squadron reachable, so the protection lands before it (Fable's build point 1, the roles table
§3 item 3; the reshape's PE1 and R5).

1. **The inventory.** Every non-test caller of `canEditSched`, `lgCanEdit`, `mayEditSched`, `isAdmin` and
   `HOOKS.editMode` is listed once, in `docs/data-schema.md` beside the key inventory, by what it guards:
   - **schedule** — a control on Edit Schedule, the Scheduler Board, View-only Sched, Logic, the day / wave / duty
     templates, the saved plans (DraftsModal), the changes window, the planning calendar, Admin → Squadron config
     (§9 F1): becomes `maySchedEditPage()` (the role in force AND admin of the squadron picked);
   - **own** — a control on Inputs, Medical, the SANS calendar and day, Quals, the OIL list, the Leave War, the Tracker,
     Admin → Users: becomes `adminOfPage('own')` (for a View holder his own squadron, so 149 picked changes nothing
     there);
   - **named squadron** — a control acting on a squadron of its own, not the page's: the Inputs, SANS and Calendar
     settings windows (their squadron `unit ?? winUnit(…)`, `state/cutoff.ts`; today guarded by `!isAdmin()` in
     `InputsSettings.tsx`, `SansSettings.tsx`, `DaysWindow.tsx`), the OIL list: becomes "admin of that squadron" with the
     role in force (`levelIn(me, u) === 'admin'`, as `ui/oilday.ts adminOfList` already asks); a window opened with no
     squadron is stamped with the squadron in view when it opens, so a later pick never moves it (red team R-O5);
   - **role** — a question that is about the person, not a squadron (the member-view switch, the bell's own reads, a
     tab's visibility where the next point does not apply): stays, with its reason.
   `canEditSched` and `lgCanEdit` are **not** rewritten blindly: about 16 of their uses sit on the Inputs window
   (`ui/inputedit.tsx`), where the schedule's squadron is the wrong question — but Admin → Data's "Clear old clutter…"
   and "Clear edit history…" (`ui/inputedit.tsx` l.2331, l.2368) act on the schedule in view's planning notes and change
   history, so they are **schedule** (R-O5).
2. **The guard test** (`state/edit-rights-readers.test.ts`, by `testing/enumguard.ts` as the roster guards count): a
   caller of the five outside the inventory fails it; red-proven by adding one.
3. **The tabs and the landing:** Edit Schedule's tab shows only where `maySchedEditPage()`; on it when the pick moves to
   a squadron he holds View of, he lands on View-only Sched (`state/store.ts` l.550's rule, now asking the squadron) —
   D2253's reading. Logic for a View holder reads as a member's Logic (its controls already return for a non-admin).
4. **Tests (red first):** Hunter, 142's admin with View of 149, 149 picked (`enterSquadron` by hand — the menu does not
   exist yet): Edit Schedule hidden and refused, the board's drags and edit mode off, every Logic control, every
   template, the saved plans, the changes window in its member form, Admin → Data's two clears; an Inputs, SANS or
   Calendar settings window opened on 142's Logic and left open while 149 is picked stays 142's; then 142 picked again,
   all back. The same with
   Plan of 149: all on. A master admin: all on in both. Each beside the gate's own refusal (§7), so a page that offers
   a control the gate refuses fails.

## 3. Step B — the Schedules menu, the board's number, every page following the pick (P3)

1. **Who has a menu:** the squadrons he may read today (`state/perms.ts readableUnits(iso)`, new, one answer: his home;
   each View or Plan that holds that day — `units-model.ts levelFrom`; every squadron for a master admin). One squadron:
   no ▾ (D2132). In the member view, a master admin's or Plan holder's other squadrons read "View only" (D2253).
2. **The look (M1, M2; D2301, D2304, O5):** `SqnMark` becomes a button ("142 ▾"); the menu a list, a tick on the
   squadron in view, a grey label — "Your squadron", "View only", "Full access" — rows 38 high on both, the panel in the
   look of the Schedule Insights menu (`ui/ScheduleInsightsMenu.tsx`, `.schedule-moremenu`: outside press, Escape, arrow
   keys, focus back to the button); on a phone a sheet from the top. Layout by Fable (D2269), drawn beside M1/M2.
3. **A pick** calls `enterSquadron(unit, holdNow() === 'war')` — the path sign-in and midnight already take; open windows
   keep today's hold (`state/typing-hold.ts`). It is navigation, not a command: nothing saved, Undo untouched (D148).
4. **Pages that follow it:** the schedule pages and Logic for everyone with a right; every page for a master admin or a
   Plan holder of the pick (`pageUnit('own')` already answers this). Step A's tabs and landing apply.
5. **[Narrowed in round 2 by §15 D2 — the page covered read only, its words from the Tracker's permitted squadron, an
   unsaved edit asked first.]** **The Tracker cannot follow a pick once it has opened** — already established on 21 Nov by the reshape's step-0 read
   of its load path: its records sit in `app/core.js`'s module caches and a one-shot init draws its board, so it cannot
   be re-read in place (`tracker/storage.js` l.66–76, `rebindStorageUnit` answers `kept`; the plan's first draft called
   this a spike — red team R-O13, R-A1). It binds to `pageUnit('own')` the first time it opens (`boot.ts` l.93), so a
   master admin or Plan holder gets the squadron picked at that moment, and keeps it for the sign-in. When the pick and
   the Tracker differ, the Tracker page says so in one line (§9 F2), its words filled from `storageUnit()` and the pick;
   its writes are already refused by the gate's 7f. No Tracker cache is reset, so no unsaved chart work is at risk.
6. **R6 goes live:** a right taken away while he is on that squadron's pages re-enters his home (`entryDue`), its tests
   now through the menu.
7. **R2:** Approvals' "New" marks one per person per squadron — the key moves into the war's unit-qualified space
   (`apprseen:<pid>` under `unitDoor`), removed from the community list (`storage/keyowner.ts` l.65); test: 142's
   Approvals opened leaves 149's marks new.
8. **The board's number (picture 2):** a small grey `sqnNum('schedule')` beside the day title (`.sb-title`), nothing
   else in the bar moving; phone width checked (`13-board-rows-responsive.css` l.598–600's ellipsis).
9. **Print and exports:** a test that with 149 picked the print's title and heading, the schedule CSV and (for a master
   admin) the LoX file name read 149.
10. **Tests:** the menu lists exactly `readableUnits` with the right label each, for the five sign-ins and with eight
    squadrons; a master admin flipping 142 ↔ 149 ten times changes no OIL credit in either (the batch plan §3.4's test,
    now through the menu); a pick and back keeps the Undo list and steps back only the unit in view's own changes.

## 4. Step C — Admin → Users by squadron (P1, PF1/O3, D2297, D2300–D2307, D2311, [ROLE-BOX-CUT-IPHONE])

The layouts by Fable (D2269); the doors by Opus.

1. **The list (7a):** `rosterOf(pageUnit('own'), today)`, the people holding Plan of that squadron that day (6b's "·
   also plans 149" on 149's list; the "Plans 149" tick finds them — R-O4), and that squadron's archived men; the heading
   counts its own people only, a Plan holder's row opening as R3 does (only that squadron's line his to change). A
   master admin's Squadron group (7d) adds other squadrons, grouped under each. Search also finds a man of another
   squadron (to give him View), his row showing his squadron, the rest of it read only (R3, 5b). `linkablePeople`
   offers only the page's squadron's men. The Waiting list shows that squadron's requests (§5). Step 3's allow-list
   entry for Admin → Users in the roster guard is removed.
2. **The filter (7a–7d; D2297, D2307):** one Filter button beside the search, a panel of tick groups — Seat (Pilots,
   WSOs, Personnel), CAT, Role (Member, Admin, "Plans 149" (D2306), Master admin), Squadron for a master admin; ticks in
   a group any of them, groups combined; lit dark on blue with its count; "Showing 1 of 61 · Clear" over the list; rows
   only hidden, A to Z kept (D322); the chips in the look of Edit Schedule's CAT / Type / Quals chips.
3. **"· also plans 149" (6a, 6b)** at the end of a Plan holder's grey line, on his own squadron's list and on 149's.
4. **The opened row (R1–R5; D2303):** Role — Member, Admin, Master admin, "Master admin" greyed for anyone but a master
   admin (D2305's short names end the cut words); then one line per squadron, "142 Home squadron" and, for each other
   squadron in the store, "149 None · View · Plan"; a master admin's other squadrons "Full access", no buttons (R4); a
   member's Plan greyed, "Plan is for admins only." (R3, D2306); a squadron not his to give reads "Only an admin of
   149 can give access to 149." (R5, D2299). Plan is offered only to a master admin; View to an admin of that squadron.
5. **One Save, one command, one Undo step:** the row's changes — role, master mark, every squadron's line — are saved
   together by a new door `state/accounts.ts saveAccess(accountId, { role, master, grants })`, a new command type
   `account.access` (in `ACCOUNT_TYPES`, `COMMAND_OPS`, and the gate's list of types allowed to change the master mark,
   `state/perms.ts` l.2652 — R-O3, R-A5). **Its contract, each check only for the part it governs:**
   - role or name changed → `updateAccount`'s checks (not his own account, a master admin's account only by a master
     admin, `otherSquadronProblem`); a row where only another squadron's line changed asks none of them (Kestrel giving
     Hunter View of 149 — R-O3b);
   - master mark changed → `setMaster`'s (a master admin only, never his own, one master admin left);
   - each squadron line → `setGrant` / `removeGrant`'s for that squadron (PA1: Plan a master admin's; View an admin of
     that squadron's), PA2's "Plan is an admin's" judged on the role **after** the Save (Member → Admin with Plan in one
     Save passes — R-O3c);
   - the last-admin and last-master locks once, over the whole state after the Save;
   - the first refusal shown, nothing of the Save committed; the gate checks the same deltas by the same rules.
   Picking Member for a master admin is the mark off and the role down in that one command (D2303), a master admin's
   alone. **Made a master admin, his View and Plan rows are dropped in the same command** — R4 shows "Full access" with
   no buttons, so a kept row would be hidden and would come back when the mark comes off (R-O10); the agent's decision,
   technical, told to him; the gate's exception like the member's drop. Tests: Saber gives Hunter Plan of 149 and View
   of 150 in one Save → one Undo puts both back; a refusal in the second change saves neither; Member → Admin plus Plan;
   Admin → Master admin (his rows dropped); Master admin → Member; the last-master and last-admin refusals.
6. **The roles table (R2, R3; D2302, D2305):** under the squadron lines, the closed "▸ What each role allows" fold in the
   Logic page's "How it works" look: the label "View and Plan are access to another squadron.", the grid of eight pages
   × five roles, the legend "✓ can change · read = can see · — cannot open", notes 1–5 as drawn
   (`docs/superpowers/briefs/2026-11-22-msq-roles-table.md` §1, §4). Its cells are one table in code
   (`ui/rolestable.ts`), and a test signs in a person of each role and checks each cell against the app's own answer —
   the page opens or not, its controls offered or not — so the table can never drift from the app (D200's rule).
7. **Add a person (6c):** "Home squadron" first, set to `pageUnit('own')`, offering the squadrons he is an admin of
   (every one for a master admin); `putNewHome` given the unit explicitly (PD1's dormant path goes live). **The chosen
   squadron carries through the whole add** (R-A3): today both creation paths then write his post-in stint through the
   loaded war (`state/accounts.ts` l.973, `leavewar/sync.ts` l.3646), and the foreign-war allow-list excludes creation
   (`state/perms.ts` l.1781) — so Saber on 142's page adding a 149 man is refused, or loses the date. The new person's
   identity and first stint are written to the chosen squadron's war in the same command (its stored copy through the
   foreign store when it is not the loaded one), the gate widened for that new person's first profile only; the same for
   approving a request (§5). Test: added with and without a sign-in while 142's war is loaded, then reloaded — the
   post-in date exists only in 149's war; a refused add leaves no person, account, home or stint.
8. **D2311:** archiving a man ends his View and Plan rows from that day, in the archive's own command (and so does a
   posting to an overseas squadron, which archives); restoring does not put them back; a suspend by hand leaves them.
   **Two gate changes** (R-O1, R-A4): `unitRowViolation`'s grant-removal rule (about l.2541–2560) gains an exception
   proven by the command's own records — the same command turns that account's person `archived` false → true, judged
   by §8 as an admin of his own squadron (like `personDeletedHere`); `postingPassViolation` (l.1189–1376) allows, for a
   verified `overseas` outcome, `GRANT_PFX` removals of the rows naming that posted man's account, and the pass's own
   `acct` lines to him (§7 item 6). Rights go even where the account was already suspended by hand (the suspension
   helpers return early there today). Archive stays outside Undo (D350). Tests: Hunter archives Ranger holding View of
   149; Hunter's Overseas posting while he holds Plan of 149, with 142's war loaded and not; an already-suspended man
   archived; a forged grant removal beside an unrelated archive refused.
9. **[ROLE-BOX-CUT-IPHONE]:** a browser test at 402 wide that every Role choice and every squadron line fits — no text
   wider than its box.

## 5. Step D — Request access asks the squadron (picture 4; B7, D2094, D2111)

1. `ui/AccessScreen.tsx` asks the squadron first, as drawn; the request row gains `unit` (`accessreq:<id>.unit`, the
   gate checking it names a squadron in the store).
2. Its audience: one reader, `requestsFor(account, today)` — the requests of squadrons he is an admin of (step F's one
   admin-line audience, §7 item 2; a master admin of every one, D2198's switch deciding whether his bell shows it) — read
   by every place that shows or counts them: the Waiting list (by the page's squadron), `AdminPage.tsx` l.243,
   `ui/Drawer.tsx` l.25, `Shell.tsx` l.320 and l.348, `topstate.ts` l.49–53 (R-O9). **Marking seen** takes the ids
   actually shown and merges them with the ones already seen that still exist — never the whole list, so opening 142's
   Waiting list leaves 149's request new (R-O9, R-A8).
   Approving, declining and linking need an admin of the request's squadron, at the door and the gate; approving makes
   the new man that squadron's (`putNewHome(pid, unit)`); linking offers that squadron's men only.
3. A request stored before this half has no squadron: read as the boot squadron's (D56 — demo data).
4. **A squadron named by a request cannot be removed under it:** the gate's "a unit removed while still named" check
   (about l.2540) counts the requests' `unit` too, so an Undo of "+ New squadron" is refused while a request names 150
   (R-O11).
5. Tests: a 149 request reaches Kestrel, never Hunter (142 only); Hunter with Plan of 149 sees it; a forged approval of
   it by a 142 admin refused at the gate; a master admin and a Plan holder with requests in two squadrons — opening one
   leaves the other new, the drawer's count included; the Undo of 150 refused while a request names it.

## 6. Step E — Admin → Squadrons (P2, PG1, D2196, D2298, D2299, D2306, D2308; 3a–3e)

1. **The panel:** a "Squadrons" tab on Admin for every admin (3d is a plain admin's), the squadrons with their place,
   then the Places list with each time zone shown as GMT+X for today (`gmtLabel`); its tile wears the map pin.
2. **A squadron's place (3b):** opened, its Place list (ending "+ New place…"), saved at once by `moveUnit`, "Saved at
   once. The new place applies from tomorrow." (D2306), by an admin of that squadron. A new place made there and the move
   onto it are **one command** — one Undo step — as "+ New squadron" is (R-O8b).
3. **A place's time zone (3d):** `setPlace`; the squadrons "at" a place are those with a place row there holding today
   **or any later day** (a move saved for tomorrow counts — R-O8a); where there are two or more, the door and the gate
   need an admin of every one (a master admin always) — else greyed with "Only an admin of both 142 and 149 can change
   the time zone: both squadrons are here." (D2299; PG1 closed), the same set naming the squadrons. A place nobody sits on
   yet is changed by an admin of a squadron moving there, or by the admin who made it (the gate's `placeIdOn(before,
   u.id, today)`, about l.2615, reads later rows too). With three squadrons at a place the words name all three ("Only an
   admin of 142, 149 and 150 …" — the agent's reading, §9).
4. **"+ New squadron" (3c, 3e; D2308, D2298):** a master admin only; number (a faded "150"), place (its list ending "+ New
   place…", which opens the place's name and time zone in the same form), first admin — picked from the admins of the
   existing squadrons who are not master admins (a master admin already acts in every squadron, so Plan gives him
   nothing and the last-admin rule would not count him — `state/lastadmin.ts` l.49–50); his line "… gets Plan of 150,
   full access to it, so 150 starts with an admin." (D2306). The new place, the squadron, its place row and the first
   admin's Plan are **one command** (`addUnit` widened to take a new place) — one Undo step. The existing last-admin
   rule already counts the first admin as its last admin.
5. **Tests:** a plain admin sees no "+ New squadron" and a forged one is refused; 150 made with a new place, then Undo,
   leaves no place behind; Hunter (142 only) refused Home base's time zone, with Plan of 149 allowed, Saber allowed;
   eight squadrons made through the door, the panel lists them.

## 7. Step F — the bell (P4, R9, R10, D2198, D2202, D2214, D2251, D2309, D2310)

1. **Every line carries its squadron (`u`),** written where it is made: an input's line its input's squadron
   (`engine/inputs.ts inputUnitOf`), the Leave War's (`lw`, `lwopen`, `lwback`) the war's, a posting's (`po`, `poback`)
   the posting's squadron, the holiday's as today. The gate checks the stamp names a squadron the command acts in. A
   line stored before has none: read as the reader's home's (D56).
2. **Who is told — one audience, used everywhere it is read** (R-O2): `adminLineAudience(u, iso)` = `adminsOf(u, iso)`
   plus every master admin who can sign in. It replaces the audience at all five places that must agree: the posting
   runner's `postingAdmins` (`leavewar/sync.ts` l.1539), `holidayTodo`'s `told` (l.1597, l.1612), the pass gate's
   `adminOfPosting` (`state/perms.ts` l.1327–1333), the line rule §7e's `ownsLine` (l.3038, PC1), and step D's request
   audience. Widening one and not the others would refuse the posting or holiday command, or write nothing.
3. **Which lines he sees:** a line of a squadron other than his home shows a small grey "149" (8b). Whoever may see
   lines of more than one squadron gets the "Show 142 149" buttons at the top of his bell (8a, 8c): a master admin's
   home on and the rest off (D2198), a Plan holder's Plan squadrons on (D2202), each his to switch. The switch is a
   saved setting per person (`bellsqn:<pid>`, a community setting written by the settings command, its `PERMS` row his
   own only) holding **only his own choices, squadron by squadron**: a squadron he never switched takes the default, so a
   Plan given later starts on (R-O12). Lines switched off are kept, not deleted: switched on, they come back.
4. **[REPLACED in round 2 by §15 D1 — the command that ends his admin right removes that squadron's admin lines; the
   text below is kept for the record and is not built.]** **D2310 and R10 — a squadron's admin lines stay only while he has been its admin without a break** from the line's day
   to today (R-O6, R-A2): his home admin role there, a Plan of it holding from on or before the line's day, or the master
   mark held from then — read from the rows' start days, as `adminThen` reads them. So Plan lowered to View, Plan taken,
   made a member, master admin taken off: that squadron's lines leave at once, read or not, and a Plan given again later
   brings none of the earlier lines back (D2218: a line leaves for good); an Undo of the take-away puts the row back with
   its start day, and the lines with it. Lines about himself stay (`noticeAboutHim`). **The member view is not a loss of
   rights:** the rule reads his rows, never the role in force, so a tap to the member view and back retires nothing.
   `noticeLeftBell`'s move rule reads the line's `u` in place of the reader's home on the line's day.
5. **R9:** a tap on a line of another squadron enters it (`enterSquadron`) and then lands, only where he may read it; a
   line of a deleted man opens nothing (D1691).
6. **His own account (D2251, D2309, [ACCOUNT-STATUS-TOLD]):** a new line kind `acct` to the man himself: "Given Plan of
   149: full access to 149 · Saber", one shape for each change — the full words in §9 F3. It opens nothing. A suspended
   man reads it once enabled (he cannot sign in meanwhile). **What owes a line is a change of his access in force**, from
   whatever record made it (R-A6): his account row (role, on/off, master mark), a grant row alone (View given without his
   role changing), or his home (a move ending his rights). The gate lets an `acct` line reach only the person whose access
   that command changed, its words matching the change exactly; a line naming anyone else, or a change that did not
   happen, is refused. **A change that takes effect later** — a move saved today ends his rights from tomorrow — is told
   when it takes effect, not when saved: the app's own writer (no setter, so the no-name words of §9 F3) writes it once,
   its id fixed by the change, at the first load on or after that day; a move cancelled before then tells nothing. The
   posting pass writes the same no-name line for an Overseas posting's end of his rights (§4 item 8). It sits beside
   D2200's later choice of notifications, on by default.
7. **A posting that could not run (9a; D2214, D2306):** the amber line on his Admin → Users row — "Posting out could not
   run. The app tries again the next time it opens. If this line is still here after that, report it …" — and once, a
   line to his squadron's admins (`adminLineAudience`), "Outlaw · Fri 20 Nov / Posting out could not run. See his row on
   Admin → Users.", a tap opening his row; not for the last-admin hold, which keeps its own words. **Written by its own
   operation, after the posting's command was refused and rolled back** (a line inside that command would roll back with
   it — R-A7, R-O15): a new command type (`posting.failed`) and its own gate rule — the posting it names is saved, due,
   not done and not held by the last-admin rule, the line's id the posting's, its readers that squadron's audience; a
   retry finds the id and writes nothing. "The first failure" is the posting's own failure after the runner's existing
   retry of each posting alone, so a group attempt that fails never labels every posting in it.
8. **Tests (red first):** a 149 posting's and a 149 holiday's lines reach Kestrel and Saber (shown only once Saber
   switches 149 on) — never an input's line, which goes only to the people named and its filer (R-O14); Hunter
   with Plan of 149 sees 149's lines on, marked "149"; Plan → View, Plan → None, made a member, master admin off — those
   lines gone at once, his own staying, with the bell open; Plan taken and given again brings none back; the member view
   and back retires nothing; a tap on a 149 line from 142's pages opens 149's page; each change of access — a grant-only
   change among them — writes its `acct` line to the man only; a move saved today tells him at the first load of its day,
   once, and a move cancelled first tells nothing; a forged `acct` line naming an unaffected person refused; a failed
   posting rings once across three loads, with 142's war loaded and not, beside a posting that ran; a forged
   `posting.failed` refused.

## 8. Step G — a sign-in waits for the last save (P6; D2205 M2; picture 10)

`ui/Login.tsx`'s submit asks `saveWaiting()`; while it waits, the drawn message (picture 10) and the sign-in held.
**Sign-out still owes its reload** (`ui/logout.ts` l.33 — "reload once the save lands, if nobody is signed in"), and the
reload is what gives the next person a fresh Tracker (it cannot be reset in place, §3 item 5) — so when the save lands
with a reload owed, the reload runs first, and the sign-in card comes back with the typed name kept (never the password)
for one more press of Sign in (R-O7). Whether picture 10's words then need a second line is §9 F6. Test: sign-out with a
save held, the next person types his sign-in on the same page, the save lands — the save is under the first person's
name, the page reloads, the name is kept, and after he signs in his Tracker is his own squadron's.

## 9. Found while planning — his look first, one picture each, at the build's start

- **F1 — Admin → Squadron config (the day, wave and duty templates) with a View pick.** Its templates are the schedule
  in view's (they sit with the schedule's settings in memory), so with 149 picked a View holder's Squadron config would
  hold 149's. Recommended: it follows the schedule's squadron as Logic does — editable by an admin of the squadron in
  view, read only otherwise, its heading naming the squadron ("Squadron config · 149"). Drawn and put to him first.
- **F2 — the Tracker after a pick** (it cannot follow one once opened — §3 item 5, settled 21 Nov). The Tracker
  page, when it holds another squadron than the one picked, says so in one line, its numbers filled in: "This is 149's
  Tracker. To open 142's, sign out, sign in, pick 142, then open the Tracker." (the red team's words, R-O13 — the
  Tracker is the squadron picked when it first opened, not always his home). Drawn and put to him first. Its cost named
  to him: a master admin or Plan holder working in two squadrons' Trackers signs out between them; making the Tracker
  re-readable in place is a rebuild of its core, recommended against for this batch.
- **F3 — the own-account lines' words (D2309's shape, his approval of the shape for every change):** "Made an admin of
  142 · Saber", "Made a member · Saber", "Suspended · Saber" (read once enabled), "Enabled · Saber", "Given View of 149 ·
  Saber", "View of 149 ended · Saber", "Given Plan of 149: full access to 149 · Saber", "Plan of 149 ended · Saber", "Made
  a master admin · Saber", "Master admin taken off · Saber"; written by the app itself, with no one's name (a move or a
  posting records no setter, D1690 — R-O1): "View of 149 ended: you moved to 150", "Plan of 149 ended: archived". Shown
  to him on one page with the rest of §9, not built until he answers.
- **F4 — a person with no sign-in, opened on Admin → Users** (R-O16a): rights belong to a sign-in, so his squadron lines
  have nothing to hold. Recommended: the lines show greyed with "Give him a sign-in first to give access." Drawn first.
- **F5 — eight squadrons on an iPhone** (R-O16b): the bell's "Show" buttons, a person's squadron lines, the filter's
  Squadron group and the menu, drawn with eight; recommended: the bell's buttons scroll sideways in one row, the
  squadron lines and menu grow a row each. Drawn first.
- **F6 — picture 10 after the reload** (§8): if the second press of Sign in needs a line, recommended "Saved. Press Sign
  in again." under the kept name. Drawn first.
- **Told, not asked:** a master admin's View and Plan rows are dropped when he is made one (§4 item 5 — "Full access"
  shows no buttons, so a kept row would be hidden and come back later). Archive stays outside Undo (D350).
- **Not in this half, named:** D2220's lines to others (Plan given told to that squadron's admins, a shared place's time
  zone changed told to the other squadron — not drawn; the page promised only the three lines of §7), filed for batch
  2's page under [MULTI-SQN-DESIGN]. The words for a place shared by three squadrons (§6 item 3) follow D2299's rule.
  Batch plan step 6 (the second demo squadron and the store's fresh start) is done already (step 4 seeded 149) and
  nothing here needs the store cleared — if the build finds otherwise, he is told before the merge (the page's promise).

## 10. Order, who builds, and the files

| Phase | Steps | Builder | Main files |
|---|---|---|---|
| 1 | A (edit rights) | Opus | `state/auth.ts`, `state/perms.ts`, `state/store.ts`, the 37 caller files, `docs/data-schema.md` |
| 2 — doors | C's doors (`saveAccess`, the list, D2311), D, E's doors (`addUnit` with a place, PG1), F's lines, audiences, gate kinds and setting, G | Opus | `state/accounts.ts`, `state/units.ts`, `state/perms.ts`, `state/notices.ts`, `state/noticeseen.ts`, `leavewar/sync.ts`, `ui/Login.tsx` |
| 3 — screens | B's menu and C's Admin → Users layouts | Fable (D2269), each beside its drawing | `ui/topbits.tsx`, a new `ui/SquadronMenu.tsx`, `ui/UsersPanel.tsx`, `ui/rolestable.ts`, the CSS |
| 3 — screens | B's board number and Tracker, D's screen, E's panel, F's bell buttons and mark | Opus | `ui/SchedBoard.tsx`, `tracker/`, `ui/AccessScreen.tsx`, a new `ui/SquadronsPanel.tsx`, `ui/AdminPage.tsx`, `ui/topbits.tsx` (after Fable's menu) |
| 4 | documents (below), the drawing check, the walk, the reads | host | — |

One branch (`claude/msq-b1-screens-135`), committed in that order; phase 3's two builders touch different files
(`ui/topbits.tsx` one after the other). Phase 2's doors land before any screen calls them, each with its tests.
**Documents, in the same changes:** `docs/data-model.md` §11 (every new row and rule: `saveAccess`, the request's
squadron, the time-zone rule, `bellsqn`, the `acct` and `pofail` lines), `docs/notifications-register.md` (the new kinds,
the badges and switches built), `docs/data-schema.md` (the new keys, the moved `apprseen`), `docs/ui-contracts.md` (the
menu, the filter), `docs/file-map.md` (new files), `docs/feature-impact.md`; the People & accounts page's "not built"
lines marked built. Rulings pages are never trimmed by a source change (D29).

## 11. Tests overall, and eight squadrons

- **Red first** for every behaviour named in steps A–G; the host reruns red and green.
- **`useMsqWorld({ units: n })`** (test-support): adds squadrons 150 onward up to `n`, each with an admin, a member and a
  place, through `addUnit` — the same door "+ New squadron" uses. Eight in the menu, Admin → Users' lines, the filter's
  Squadron group, the bell buttons, Admin → Squadrons; the time a pick takes measured on two squadrons and on eight
  at the build's start and reported to him as measured (no figure is guessed); a slow one is a finding.
- **The drawing check** (D1494) against R1–R5, M1–M2, pictures 1–2, 3a–3e, 4, 6a–6c, 7a–7d, 8a–8c, 9a–9b, 10, at his
  iPhone's width (402) and a desktop's (1536 × 864) — D2306's five wordings and D2299's two sentences the named
  departures; every other difference over about 2 px fixed or put to him.
- **Gates:** GitHub's run (the repo is public); `npm run build` for the types; `node reference/tfin.js` 728/0.

## 12. The bug check (FULL) — what the order will make of it

- **The eight questions:** roles — YES; saved data (new records, a request's squadron, bell setting) — YES; the warning
  list (refusal words) — YES; new surfaces (menu, panel, filter, table) and new gestures — YES; the rest answered in the
  sheet. **FULL.**
- **The roll-call** (§6 of the order, at build time): every place that draws a squadron's number, a person's access, a
  bell line, the Edit Schedule tab, an edit control a View holder could reach — Step A's inventory is its start.
- **The walk:** the five seeded sign-ins (Saber, Hunter — with View, then with Plan of 149 — Ranger, Kestrel, Osprey)
  and eight squadrons made on screen through "+ New squadron", desktop and iPhone; the plain-user round (D1557) on
  every page each one opens; a master admin's every page after a pick; a View holder pressing every edit control on
  149's pages; Request access as a new person to 149; Plan given and taken away with the bell open; a posting held to
  fail. Walked by Opus (D2256), the host opening every picture that decides something. Sized by `docs/walk-ledger.md` at
  build time.
- **Reads after the walk:** Astra, a fresh blind Opus reader, Fable and the security reader, blind to each other
  (D2224, D2236, D1411).

## 13. Red team of this plan

Before any of it is built: Astra and a fresh Opus reader, blind to each other (the important plan's red team), asked
what the plan leaves out or gets wrong against the rulings and the code. Round 1 on `225c6eab` (brief
`docs/superpowers/briefs/2026-11-22-msq-b1-second-half-plan-read-brief.md`; reports `…-read-astra.md`, `…-read-opus.md`
beside it). Their findings and what the plan did: §14. The host spot-checked the code claims it acted on (the master
mark's own-command rule, `adminsOf`'s master admins, `markRequestsSeen`, the drawer's count, D350) — each held.

## 14. Round 1's findings and what the plan did

R-O is the fresh Opus reader's numbering, R-A Astra's. Where both found one thing it is one row.

| Id | Found | What the plan did |
|---|---|---|
| R-O1, R-A4 | D2311's end of rights on archive and Overseas posting refused by the gate (`unitRowViolation`'s grant rule; `postingPassViolation`) | §4 item 8: both gate exceptions, proven by the command's own records; already-suspended men; tests incl. forged |
| R-O2 | the master admins' new bell audience named at one of five places | §7 item 2: one `adminLineAudience` at all five |
| R-O3, R-A5 | `saveAccess` refused by the master-mark rule; whole-change checks refuse ordinary saves | §4 item 5: `account.access`, the contract part by part, PA2 after the Save, locks once; tests |
| R-O4 | 149's list cannot show its Plan holders | §4 item 1: Plan holders listed, rows as R3, heading counts own people |
| R-O5 | step A misses Admin → Data's clears and the settings windows | §2 item 1: the fourth kind "named squadron", the clears under schedule, windows stamped; tests |
| R-O6, R-A2 | D2310 as judged keeps lines on Plan → View and brings removed lines back | §7 item 4: admin without a break from the line's day; member view retires nothing; tests |
| R-O7 | step G races sign-out's owed reload | §8: the reload first, the name kept, one more press; §9 F6 |
| R-O8 | a shared place judged on today only; a new place's correction refused | §6 items 2–3: today or later rows; new place and move one command |
| R-O9, R-A8 | marking requests seen marks every squadron's; the drawer's count missed | §5 item 2: one `requestsFor`, seen marks only the ids shown, merged |
| R-O10 | made a master admin, his rows hide and come back | §4 item 5: dropped in the same command — the agent's decision, told (§9) |
| R-O11 | Undo of "+ New squadron" leaves a request naming it | §5 item 4: the removed-unit check counts requests |
| R-O12 | the saved bell switch turns a later Plan's default off | §7 item 3: only his own choices stored |
| R-O13, R-A1 | the Tracker spike repeats a settled read; F2's words wrong in one case; a reset would risk unsaved chart work | §3 item 5: no spike, no reset; §9 F2's words filled from the Tracker's squadron and the pick |
| R-O14 | the bell test sent an input line to admins | §7 item 8: a posting's and a holiday's lines instead |
| R-O15, R-A7 | the "could not run" line rolls back with its posting, and could be forged | §7 item 7: its own operation after the rollback, its own gate rule; "first failure" defined |
| R-O16 | not drawn: a person with no sign-in; eight squadrons on an iPhone | §9 F4, F5 |
| R-A3 | the chosen Home squadron does not carry through the post-in record | §4 item 7: the stint written to the chosen squadron's war in the same command; tests |
| R-A6 | own-account lines miss grant-only changes and tell a future move too early | §7 item 6: owed by any change of access in force; a later change told when it takes effect, once |
| R-A9 | the plan asked an archive Undo that D350 keeps out | §0 and §4 item 8: archive stays outside Undo |

**Round 2** (the same two readers, blind, on the revised plan — whether each fix above is right and complete, and
anything the revision broke) before the build; at most three rounds (the design red-team cap). Done: §15.

## 15. Round 2 — three readers, and what the plan did

Round 2 on `db88bc66`: Astra and a fresh Opus reader on round 2's brief (`…/2026-11-22-msq-b1-second-half-plan-read2-brief.md`),
and — on his ask, 22 Nov 26 ("should we also ask an independent fable reviewer to red team the plan?"), by D2255's
rule for high-risk work — Fable on round 1's brief, asked where the plan's shape breeds faults; the three blind to each
other. Reports beside the brief: `…-read2-astra.md`, `…-read2-opus.md`, `…-read-fable.md`. The host spot-checked the
code claims it acted on (Fable's 1–4; the others' overlap them) — each held. **Where §15 and an earlier section differ,
§15 is the plan.** R2-A is Astra's numbering, R2-O the Opus reader's, F Fable's.

**Fable's shape answer, adopted as the rule for the build:** the pick is a second meaning of "the squadron" laid over
three things that keep their own — the Tracker's bound door, the settings held in memory (`VCONF`, the templates) and
the bell. Every reader of any of the three reachable from an own page is listed and marked (D4), not only the edit rights.

### The decisions

- **D1 — a lost admin right takes its squadron's admin lines with it, in the same command** (replaces §7 item 4; closes
  R2-A2, R2-O1–3, F4, F6). Three readers showed that "admin without a break, read from the rows' start days" cannot be
  read: the home role keeps no start day (`accounts.ts adminRecFor` l.352–362), rows keep days not moments (a right taken
  at 10:00 and given back at 11:00 brings 09:00's line back), and deleting a Plan row on promotion erases the history.
  So no continuity is worked out at read time. **The command that ends a man's admin level in a squadron** — Plan taken
  or lowered to View, made a member (his home's admin lines and every Plan's), master admin taken off (every squadron he
  is no longer admin of) — **also removes his stored lines of that squadron of the admin kinds** (`po`, `poback`,
  `oilhol`, the posting-failed kind). They leave at once, read or not (D2310), and a right given back later brings none
  back (D2218: for good); an Undo of that command puts the right and the lines back together. The gate passes those
  removals only where the same command's records show his level in that squadron going from admin to not (judged
  before and after, as the member's drop is judged). A **gain** removes nothing: made a master admin, his Plan rows go
  (R-O10, still right — "Full access" shows no buttons) and his lines stay, his bell switch written "on" for each
  squadron he held Plan of, so they stay in view (D2198 would default them off). The derived lines (the "off the
  manpower" and "dates ended" lines) need nothing: they are worked out live from the audience. The move rule
  (`noticeLeftBell`) stays as it is. The agent's reading, told to him: an admin made a member loses his own squadron's
  admin lines too (D2310 names the Plan squadron; the same reason applies). Tests: Plan → View, Plan → None, made a
  member, master admin off — the lines gone at once with the bell open; taken at 10:00 and given at 11:00 — none back;
  Undo of the take-away — all back; made a master admin — none gone; a forged removal of another man's lines refused.
- **D2 — the Tracker after a pick** (narrows §3 item 5; R2-A1, R2-A5, R2-O15, F1). The Tracker's **permitted squadron**
  is `pageUnit('own')` — for a View holder always his home. When the bound Tracker (`storageUnit()`) is not it: (a) if he
  may still edit the bound squadron's Tracker (it is a squadron he holds Plan of, or he is a master admin), the page is
  covered read only — no control offered, the gate's 7f clause kept — with "This is 149's Tracker. Pick 149 to change
  it."; (b) if he may no longer open it at all (Plan lowered or taken, the member view — D2252, D2253), its contents are
  hidden, every control, export and key handler off, the records kept in memory (no reset, no unmount — so a draft is
  not lost), with "You can't open 149's Tracker any more. Sign out and in to open 142's."; (c) bound = permitted:
  nothing shown. **With unsaved Tracker edits a pick asks first**, sign-out's Save / Discard / Stay question
  (`trackerMayLogOut`). Both lines, and the pick-time bands of an open Leave War window and an open Input window (today
  "This change could not be saved." when nothing was tried — `state/store.ts bandWords` l.1028–1043,
  `ui/InputWindow.tsx` l.185–187), are drawn first (§9 F2, F7). Tests for each of (a)–(c), the member view and back
  keeping the draft, a bell tap reaching (a).
- **D3 — the access-request tap** (R2-A4, R2-O9, F2): the bell's access branch (`ui/topstate.ts bellTap` l.51–56) takes
  the newest unseen request among the squadrons switched on in his bell, enters its squadron when it is not the page's
  (R9's path), then opens Admin → Users — the toast naming it ("1 waiting for access to 149"). The bell alert counts
  requests of switched-on squadrons; the Admin tab's and drawer's badges count the page's squadron's only, so every badge
  has a row behind it. Test: Hunter with Plan of 149, 142 picked, a 149 request — one tap lands on 149's list and clears
  the alert; the next tap opens the bell list.
- **D4 — the second inventory: settings in memory read from an own page** (F3): beside step A's edit rights, every
  reader of `VCONF` / `ruleNow` and the in-memory templates reachable from Inputs, SANS, Quals, the OIL list, the Leave
  War and the bell's pending-OIL count is listed in `docs/data-schema.md`, marked "schedule in view" or "own squadron",
  with its guard test. First known case: an input's OIL amount (`leavewar/sync.ts oilAskPlan` l.1382 → `engine/oil.ts
  inputOilAmt` l.107–112 → `ruleNow('oilFullMin')`) reads the input's own squadron's threshold, as `engine/inputs.ts
  cutBackFor` l.1224 reads its cut-off. Test (red first): Hunter with View of 149, 149's threshold changed — his own
  Saturday input asks the same with 149 picked as with 142; the bell's pending count the same. `desiredOilCells` traced
  at build time.
- **D5 — own-account lines are about him** (R2-O6, F4): `noticeAboutHim` returns true for `acct`; an `acct` line carries
  no squadron mark, so neither the bell switch, the grey mark nor D1 touches it, and a move keeps it.
- **D6 — the bell switch lives in `noticeLive`** (F5, R2-O19), the one body behind the list, the unread count, the lit
  bell and the seen mark: a switched-off squadron's line neither lights the bell nor is marked seen by opening it;
  switched on, it shows unread. **The switch row is the owner's alone** (R2-O12): a gate row rule — `bellsqn:<pid>` only
  for the actor's own person, by its one command — and its type in `undo/timeline.ts` NOT_STEPS (l.272). The worked-out
  posting lines are stamped with the squadron they are built for (`leavewar/sync.ts postedLinesOf` l.1723–1744; R2-O18).
- **D7 — an Undo or Redo of an access change tells him** (F7, R2-O7): it keeps the first line and writes the opposite one
  ("Plan of 149 ended · Saber") as a follow-up in its own command, as the posting's take-back is
  (`restoreFollowUpOwed`, the gate's follow-up door `state/perms.ts setFollowUpsProbe` l.2918–2920 extended to `acct`);
  unread at the Undo, the first line simply goes. `account.access` gets its Undo label (`undo/describe.ts`, R2-O19).
- **D8 — the landing is a standing check** (F8, R2-O17): after every `enterSquadron` and on the notify path, wherever the
  page is Edit Schedule and `maySchedEditPage()` is false, View-only Sched — so a pick, R6's re-entry and a Plan lowered
  while he is on the page all land him; the Admin half of `store.ts` l.550 keeps asking the role.
- **D9 — one body for "may he read this squadron"** (F9): `pickStandsOn(iso)` = `readableUnits(iso).includes(UNIT)`,
  both reading the account's own role (a Plan holder in the member view keeps 149 in his menu, "View only" — D2253).
- **D10 — the posting-failed line needs proof that the posting fails** (R2-A3, R2-O4, R2-O16): its own command type,
  written only by the runner, **out of band** like `lw.postoutRun` (`undo/timeline.ts` l.234–241 — never folded into the
  step of the person whose press woke the pass); its gate rule re-runs the named posting's own check against the stored
  rows and passes the line only where that posting is refused now, or held for a reason other than the last-admin lock
  (`stashPreflight`, `masterDeleteProblem` — `leavewar/sync.ts` l.2895–2897, `deleteBlocked` l.3277–3288); a correctly
  shaped line for a posting that would run is refused. Tests: a forgery for a due, untried posting refused; a held
  Delete rings once across three loads; a group failure followed by individual passes rings for none of those; an Undo
  of the press that woke a failing pass leaves the line.
- **D11 — own-account lines written when a change takes effect** (R2-O4, R2-O5): the app's own writer, out of band, its
  gate check keyed on the line kind — his home changes that day, the right named held the day before and not that day,
  the line to that account's man, its id the change's, dated that day; a forged one for a cancelled move refused. F3 gains
  "Made a member: you moved to 149" (a moved admin is a member of his new squadron, K3) and "Suspended" with no name (an
  Overseas posting's suspension) (R2-O8).
- **D12 — a waiting request is answered only by an admin of its squadron, whatever path deletes it** (R2-O10): the rule
  on the request row — deleting it needs an admin of its squadron, the posting pass's Delete excepted — so `addAccount`,
  `addPersonAndAccount`, a rename in `updateAccount` and `dropAccountOfPid` (`state/accounts.ts` l.570, l.987, l.644,
  l.870) are held too; at the door "He asked to join 149 — only an admin of 149 can answer it." (new words, §9 F8).
- **D13 — a place's squadrons, today or later, at the gate too** (R2-O11, F10): the gate's check (`state/perms.ts`
  l.2615–2617, today `placeIdOn` → `atOn`, the row of one day) is replaced by the set of squadrons whose place rows name
  the place holding today or from a later day — an admin of every one, a master admin always. "Or by the admin who made
  it" is dropped (a place row keeps no maker); a place is only ever made with a move or a new squadron (one command), so
  it always has a squadron.
- **D14 — smaller:** R2's moved Approvals mark keeps the own-row rule (7e matches the unit-split local name; the key in
  `UNIT_SETTING_PREFIXES` — R2-O13); `setGrant` refuses a master admin's account and the gate refuses a grant row left on
  one after the command (R2-O14); the first-admin list leaves out master admins and anyone the door would refuse (one who
  moves tomorrow) — named to him as the agent's narrowing of D2308's words (F10); step G keeps the typed name when Sign
  in is pressed (sessionStorage, in try/catch — sign-out's reload is registered first, `ui/logout.ts` l.39) and a save
  that never lands gets a test and words (§9 F6) (R2-O19).

### §9 gains (drawn first, on the same page)
- **F2** now (a) and (b) of D2; **F7** the pick-time bands of an open Leave War window and Input window; **F8** "He asked
  to join 149 — only an admin of 149 can answer it."; **F3** with D11's two lines; **F6** with the save that never lands.
- **Told, not asked:** D1's reading (an admin made a member loses his own squadron's admin lines); D14's first-admin
  list.

### The rows
| Round-1 row | After round 2 |
|---|---|
| R-O6, R-A2 | replaced by D1 |
| R-O8 | completed by D13 |
| R-O9, R-A8 | completed by D3 |
| R-O10 | stands; D1 keeps his lines, D14 closes the planted row |
| R-O13, R-A1 | completed by D2 |
| R-O15, R-A7 | completed by D10 |
| R-A6 | completed by D5, D7, D11 |
| every other row | held by both readers |

**Round 3** — the last under the cap: Astra, a fresh Opus reader and Fable, blind, on §15 alone (is each decision right,
and what does it break), before the build. Done: §16.

## 16. Round 3 — three readers, and what the plan did (the last round; the build follows)

Round 3 on `310496564`, brief `…/2026-11-22-msq-b1-second-half-plan-read3-brief.md`, reports beside it
(`…-read3-astra.md`, `…-read3-opus.md`, `…-read3-fable.md`), the three blind to each other. **Where §16 and an earlier
section differ, §16 is the plan.** R3-A is Astra's numbering, R3-O the Opus reader's, R3-F Fable's. The host
spot-checked the claims it acted on — each held: `setGrant` writes a grant's `from` as a day (`state/units.ts`
l.286–291); `adminRecFor` writes `adminFrom` only for an admin made after a move (`state/accounts.ts` l.352–362); a
role's Undo by anyone but a master admin leaves the Plan row out (`state/perms.ts restoreLeavesOut` l.2160–2178); the
pick's question would reuse "Save them before logging out?" (`tracker/app/core.js` l.94); `voidedOil` and `repricedOil`
read `inputOilAmt` (`engine/oil.ts` l.123–146); `endedLines` reads the loaded war (`leavewar/sync.ts` l.1685–1690); the
place check sits at `state/perms.ts` l.2588–2589 in that copy; a bell line keeps its moment (`Notice.at`, a number);
`adminThen` already reads a right's start for the filer's lines (`state/notices.ts` l.300).

**All three found §15 D1 does not hold** (R3-A1–3, R3-O1–7, R3-F1–4, 6): removing lines in named commands misses every
other path that ends a right (an Undo of a give, a Redo of a take-away, an archive, an Overseas posting, a non-master's
Undo of "made a member" that puts the role back without the Plan), cannot stop the worked-out posting lines coming back
on a re-grant, and its promotion write breaks D6. **The shape answer, adopted: the bell reads the right; no command
deletes another person's lines for a lost right** — so no gate rule for such removals is needed (R3-O3 falls away), and
no line of another person's step is written to (Fable's database-step note falls away).

### The decisions (D1′ replaces §15 D1 and §7 item 4; the rest add to §15)

- **D1′ — an admin-kind line is shown only while the right that brought it holds, without a break since the line was
  written.** In `noticeLive` (`state/notices.ts` l.739 — the one body behind the list, the count, the lit bell and the
  seen mark, §15 D6), beside the member-view test: a line of the admin kinds (`po`, `poback`, `oilhol`, the
  posting-failed kind) stamped `u`, and a filer's line (`fu`) told through a Plan or the master mark (R3-O2), is live
  only while (1) he is in `adminLineAudience(u, today)` by his account's own role — so it leaves at once on any path
  that ends the right (a command, an Undo, a Redo, an archive, an Overseas posting) and comes back with the right
  (D2310); and (2) the right he holds in `u` now began no later than the line's moment (`at`), so a right given back
  later brings none of the old lines back (D2218 "for good"). **The start moment:** each road keeps one — a grant row's
  new `fromAt` (written whenever its level becomes `admin`, by `setGrant`); the account row's new `adminAt` (whenever the
  home role becomes admin) and `masterAt` (with the master mark, beside `masterFrom`). An Undo restores rows whole, so a
  right put back brings its own start and its lines with it, and a role put back without its Plan (`restoreLeavesOut`,
  D2250) brings back the home's lines only (R3-A3, R3-F3). A row stored before this build has no moment and counts from
  the start (D56: demo data). The worked-out posting lines (`postedLinesOf`, `leavewar/sync.ts` l.1723–1744) take the
  same test against the posting's own day: a posting dated before the day the present right began is not shown (R3-A1,
  R3-O5, R3-F4). The agent's reading, told to him: a posting of the very day a right is given back shows again — a
  posting keeps a day, not a moment. Tests: Plan → View, Plan → None, made a member, master admin off, archive, Overseas,
  an Undo of a give with a line arrived since, a Redo of a take-away — each line gone at once with the bell open; taken
  at 10:00 and given at 11:00 — none back, stored or worked out; an Undo of the take-away — all back; a non-master's Undo
  of "made a member" — 142's back, 149's not, and not after a later Plan of 149 either.
- **D1′a — made a master admin, he keeps his lines without his bell switch being touched** (R3-A2, R3-O4, R3-F1): the
  command drops his Plan rows (R-O10) and writes on his account row `kept: {<unit>: <that Plan's start>}` for each one
  dropped; for those squadrons his `masterAt` counts from that start, and his bell's default reads "on" (D2198's "off"
  for the rest). His own `bellsqn` choices still win, and no one else's command writes them (§15 D6 and §7 item 3
  stand). Cleared when the mark comes off; an Undo restores the row whole. Tests: promoted with 149 unset, on and off —
  each saves and the bell reads on, on, off; Saber's Undo goes through after Hunter switched 149 off.
- **D1′b — a master admin's move keeps the squadrons he is still admin of** (R3-F6): `noticeLeftBell`'s last branch
  (`state/notices.ts` l.729–731) leaves an admin-kind line stamped `u` only where, from the move day, he is not admin of
  `u` by any road (`adminThen`). A Plan holder's move ends his Plan (D2203), so his lines still leave. Tests: Saber's move
  keeps 149's; Hunter's move with Plan of 149 loses them.
- **D1′c — the posting take-back works over the stored lines** (R3-O7): `retractPostingLines` deletes the take-back's
  lines from the stored rows whether shown or hidden, so a later Undo that gives a right back never shows a line for a
  posting taken back since. Test that sequence.
- **D2′ — the Tracker after a pick** (R3-A4, R3-O8–9, R3-F10): (a)'s condition is his account being an admin of the bound
  squadron today by any road (home role, Plan or the master mark — `levelOfAccount(levelAcct(acct), bound, iso) ===
  'admin'`, or master — read from the account, not the role in force); (a)'s words gain the road back: "This is 149's
  Tracker. Pick 149 to change it. To open 142's, sign out and in."; (b) only where that fails; in the member view its own
  line, "This is 149's Tracker. Leave the member view to open it." A pick with unsaved chart edits asks its own question
  — "Save them before switching to 142?", Save / Discard / Stay — Save saving to the bound Tracker before the pick goes
  on, never jumping to the Tracker page first. All drawn (§9 F2, now four pictures).
- **D3′** — the toast "1 waiting for access to 149" is new words: drawn (§9 F9) (R3-A4, R3-O15, R3-F10).
- **D4′ — the inventory gains two readers** (R3-O12, R3-F8): `voidedOil` and `repricedOil` (`engine/oil.ts` l.123–146) —
  `inputOilAmt` takes the input's squadron, as `cutBackFor` does, at the door and at the gate (test red first: a remark
  edit with 149 picked keeps a Yes worked under 142's threshold); and `endedLines` (`leavewar/sync.ts` l.1685), which
  reads the wars of the reader's home squadron, not the loaded one when it is another (test red first: 149 picked, the
  "bidding closed" line and the unread count unchanged). Both marked "own squadron".
- **D5′ / D6′ — the switch spares lines about him; the own-account door's place** (R3-F5, R3-O13): in `noticeLive` the
  bell switch is asked only where `!noticeAboutHim(n)` and the line carries a squadron (tests: his own leave decision
  stamped 142 after his move to 150 stays; a filer-only line follows the switch). The gate checks an `acct` line before
  `ownsLine` and "a bell line about nothing the command changed" (`state/perms.ts` l.3108, l.3150–3154); the app's own
  writer (D11) has a section of its own, as `postingPassViolation` has; its line carries `at` = now and the day = the
  change's day.
- **D7′ — an Undo of an access change follows the war's shape** (R3-O10, R3-F9): the Undo always takes the step's
  own-account line; where he had read it, the restore writes the opposite line ("Plan of 149 ended · Saber") inside its
  own envelope, proved by §7's own-account rule over the replayed rows (not the follow-up probe); the Redo puts the first
  line back by verified replay, and where he had read the opposite line writes a fresh unread one, as the war's "again"
  line does. No separate follow-up command, so nothing new enters the Undo list. The own-account part stores the
  squadron's number as written (`num`) beside its id, so a line about "+ New squadron" still prints 150 once the squadron
  is undone. The Undo label is new words: drawn (§9 F10). Tests: give → read → Undo → Redo; the Undo of "+ New squadron".
- **D10′ — the proof of a refused posting is the runner's own record** (R3-O11, R3-F7): the runner hands its refused keys
  (`PO_REFUSED`, set by the retry, and `FX_REFUSED`) to the gate through a probe, as `setLwPostingProbe` does; the
  posting-failed line passes where `poHeldReason` gives a reason other than the last-admin lock, or the probe holds that
  posting's key. A group failure sets no key before the single retries ("rings for none"). Test a gate-refused posting.
- **D11′ — the writer runs at midnight too** (R3-F11): wherever the posting pass runs on a new day (the midnight wake,
  `leavewar/sync.ts` l.3044–3046), as well as at sign-in.
- **D13′ — an empty set is a master admin's** (R3-O14, R3-F12): where no place row names the place today or later, only a
  master admin may change it; and a new place row passes only where the same command writes a squadron's place row
  naming it, or the actor is a master admin (`setPlace`, `state/units.ts` l.250–259, can make one alone today). Tests
  for both. §15's line numbers corrected from the readers' copy (the check at l.2588–2589; `stashPreflight` /
  `masterDeleteProblem` inside `poHeldReason` l.2812–2824).
- **Held by all three:** D8, D9, D12, D14.

### §9 gains (drawn first, on the same page)
- **F2** four pictures: (a) with its road back, (b), the member view, the pick's own question; **F9** the toast; **F10**
  the Undo label for an access change.
- **Told, not asked:** a posting of the very day a right is given back shows again (D1′); a master admin keeps his Plan
  squadrons' lines, their bell default "on", when made one (D1′a).

The cap is reached (three rounds): what is left is folded into the build and checked by its code reads and the walk
(the bug-check order's FULL tier, §12).
