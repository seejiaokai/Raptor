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
6. Three things found while planning need your look before they are built (§9) — one picture each, at the build's start.

## 0. Ground rules

- **Rulings that bind every step:** a scheduler is always an admin (D785). Demo data already stored is not a finding
  (D56). Undo steps back one's own changes only, never cleared as a shortcut (D148); a change made with one press is one
  Undo step. A move counts from the next day (D2119) and ends every View and Plan (D2203). View reaches only the other
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
   - **role** — a question that is about the person, not a squadron (the member-view switch, the bell's own reads, a
     tab's visibility where the next point does not apply): stays, with its reason.
   `canEditSched` and `lgCanEdit` are **not** rewritten blindly: about 16 of their uses sit on the Inputs window
   (`ui/inputedit.tsx`), where the schedule's squadron is the wrong question.
2. **The guard test** (`state/edit-rights-readers.test.ts`, by `testing/enumguard.ts` as the roster guards count): a
   caller of the five outside the inventory fails it; red-proven by adding one.
3. **The tabs and the landing:** Edit Schedule's tab shows only where `maySchedEditPage()`; on it when the pick moves to
   a squadron he holds View of, he lands on View-only Sched (`state/store.ts` l.550's rule, now asking the squadron) —
   D2253's reading. Logic for a View holder reads as a member's Logic (its controls already return for a non-admin).
4. **Tests (red first):** Hunter, 142's admin with View of 149, 149 picked (`enterSquadron` by hand — the menu does not
   exist yet): Edit Schedule hidden and refused, the board's drags and edit mode off, every Logic control, every
   template, the saved plans, the changes window in its member form; then 142 picked again, all back. The same with
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
5. **The Tracker** follows a master admin's or Plan holder's pick only if it can be re-read in place — today it binds
   once (`tracker/storage.js rebindStorageUnit` answers `kept`). Step B starts with a spike (§9 F2): read the Tracker's
   load path; if its caches can be reset and `TrackerPage` re-mounted under the unit, build that, with a test
   142 → 149 → 142 showing each squadron's courses and Undo steps carrying their squadron (A-v); if not, the band named in
   F2, drawn first.
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

1. **The list (7a):** `rosterOf(pageUnit('own'), today)` and that squadron's archived men; its heading counts them. A
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
   together by a new door `state/accounts.ts saveAccess(accountId, { role, master, grants })`, which runs every existing
   door's checks (`updateAccount`, `setMaster`, `setGrant`, `removeGrant`, the last-admin and last-master locks, PA1,
   PA2, D2250's member's drop) on the change as a whole and commits once; the first refusal is shown, nothing saved.
   Picking Member for a master admin is the mark off and the role down in that one command (D2303), a master admin's
   alone. Test: Saber gives Hunter Plan of 149 and View of 150 in one Save → one Undo puts both back; a refusal in the
   second change saves neither.
6. **The roles table (R2, R3; D2302, D2305):** under the squadron lines, the closed "▸ What each role allows" fold in the
   Logic page's "How it works" look: the label "View and Plan are access to another squadron.", the grid of eight pages
   × five roles, the legend "✓ can change · read = can see · — cannot open", notes 1–5 as drawn
   (`docs/superpowers/briefs/2026-11-22-msq-roles-table.md` §1, §4). Its cells are one table in code
   (`ui/rolestable.ts`), and a test signs in a person of each role and checks each cell against the app's own answer —
   the page opens or not, its controls offered or not — so the table can never drift from the app (D200's rule).
7. **Add a person (6c):** "Home squadron" first, set to `pageUnit('own')`, offering the squadrons he is an admin of
   (every one for a master admin); `putNewHome` given the unit explicitly (PD1's dormant path goes live).
8. **D2311:** archiving a man ends his View and Plan rows from that day, in the archive's own command (and so does a
   posting to an overseas squadron, which archives); restoring does not put them back; a suspend by hand leaves them.
   Tests for each, Undo of the archive putting them back with it.
9. **[ROLE-BOX-CUT-IPHONE]:** a browser test at 402 wide that every Role choice and every squadron line fits — no text
   wider than its box.

## 5. Step D — Request access asks the squadron (picture 4; B7, D2094, D2111)

1. `ui/AccessScreen.tsx` asks the squadron first, as drawn; the request row gains `unit` (`accessreq:<id>.unit`, the
   gate checking it names a squadron in the store).
2. Its audience: the Waiting list, the Admin tab's count, the bell line and `reqseen` read only requests of squadrons he
   is an admin of (`adminsOf(unit)`, a master admin of every one — D2198's switch decides whether his bell shows it).
   Approving, declining and linking need an admin of the request's squadron, at the door and the gate; approving makes
   the new man that squadron's (`putNewHome(pid, unit)`); linking offers that squadron's men only.
3. A request stored before this half has no squadron: read as the boot squadron's (D56 — demo data).
4. Tests: a 149 request reaches Kestrel, never Hunter (142 only); Hunter with Plan of 149 sees it; a forged approval of
   it by a 142 admin refused at the gate.

## 6. Step E — Admin → Squadrons (P2, PG1, D2196, D2298, D2299, D2306, D2308; 3a–3e)

1. **The panel:** a "Squadrons" tab on Admin for every admin (3d is a plain admin's), the squadrons with their place,
   then the Places list with each time zone shown as GMT+X for today (`gmtLabel`); its tile wears the map pin.
2. **A squadron's place (3b):** opened, its Place list (ending "+ New place…"), saved at once by `moveUnit`, "Saved at
   once. The new place applies from tomorrow." (D2306), by an admin of that squadron.
3. **A place's time zone (3d):** `setPlace`; on a place more than one squadron sits on, the door and the gate need an
   admin of every squadron there (a master admin always) — else greyed with "Only an admin of both 142 and 149 can
   change the time zone: both squadrons are here." (D2299; PG1 closed). With three squadrons at a place the words name
   all three ("Only an admin of 142, 149 and 150 …" — the agent's reading, §9).
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
2. **Who is told:** a squadron's admin lines reach `adminsOf(u)` and every master admin; the gate's line rule (§7e's
   `ownsLine`) passes a line to a master admin for any squadron, as it passes one to a Plan holder (PC1).
3. **Which lines he sees:** a line of a squadron other than his home shows a small grey "149" (8b). Whoever may see
   lines of more than one squadron gets the "Show 142 149" buttons at the top of his bell (8a, 8c): a master admin's
   home on and the rest off (D2198), a Plan holder's Plan squadrons on (D2202), each his to switch. The switch is a
   saved setting per person (`bellsqn:<pid>`, a community setting written by the settings command, its `PERMS` row his
   own only). Lines switched off are kept, not deleted: switched on, they come back.
4. **D2310 and R10:** a line leaves his bell at once, read or not, when he can no longer read its squadron that day —
   Plan taken away, made a member, master admin taken off — judged by the line's `u` against `levelFrom` today; lines
   about himself stay (`noticeAboutHim`). `noticeLeftBell`'s move rule reads the line's `u` in place of the reader's home
   on the line's day.
5. **R9:** a tap on a line of another squadron enters it (`enterSquadron`) and then lands, only where he may read it; a
   line of a deleted man opens nothing (D1691).
6. **His own account (D2251, D2309, [ACCOUNT-STATUS-TOLD]):** a new line kind `acct`, written in the same command as the
   change, to the man himself: "Given Plan of 149: full access to 149 · Saber", and one shape for each change — the
   full words in §9 F3. It opens nothing. A suspended man reads it once enabled (he cannot sign in meanwhile). The gate
   lets an `acct` line reach only the man whose account the command changed, and only with the words of what it
   changed (a line about nothing the command changed stays refused, as today). It sits beside D2200's later choice of
   notifications, on by default.
7. **A posting that could not run (9a; D2214, D2306):** the amber line on his Admin → Users row — "Posting out could not
   run. The app tries again the next time it opens. If this line is still here after that, report it …" — and once, the
   first time it fails, a line to his squadron's admins, "Outlaw · Fri 20 Nov / Posting out could not run. See his row on
   Admin → Users.", a tap opening his row; not for the last-admin hold, which keeps its own words. "Once" is the line's
   id (one per posting): a retry finds it and writes nothing. A new war line kind (`pofail`) at the gate.
8. **Tests (red first):** a 149 input's line reaches Kestrel and Saber (shown only once Saber switches 149 on); Hunter
   with Plan of 149 sees 149's lines on, marked "149"; Plan taken away → those lines gone at once, his own staying; a
   tap on a 149 line from 142's pages opens 149's page; each status change writes its `acct` line to the man only; a
   forged `acct` line to someone else refused; a failed posting rings once across three loads.

## 8. Step G — a sign-in waits for the last save (P6; D2205 M2; picture 10)

`ui/Login.tsx`'s submit asks `saveWaiting()`; while it waits, the drawn message (picture 10) and the sign-in held, then
`onSavesLanded` signs in. Test: a save held, the next person's sign-in waits and then lands, the save under the first
person's name.

## 9. Found while planning — his look first, one picture each, at the build's start

- **F1 — Admin → Squadron config (the day, wave and duty templates) with a View pick.** Its templates are the schedule
  in view's (they sit with the schedule's settings in memory), so with 149 picked a View holder's Squadron config would
  hold 149's. Recommended: it follows the schedule's squadron as Logic does — editable by an admin of the squadron in
  view, read only otherwise, its heading naming the squadron ("Squadron config · 149"). Drawn and put to him first.
- **F2 — the Tracker after a pick, if the spike (§3 item 5) shows it cannot be re-read in place.** Recommended, only in
  that case: the Tracker stays on his own squadron for the rest of the sign-in and says so in one line — "This is 142's
  Tracker. Sign out and in again to open 149's." — drawn and put to him first. If it can be re-read, nothing new to see.
- **F3 — the own-account lines' words (D2309's shape, his approval of the shape for every change):** "Made an admin of
  142 · Saber", "Made a member · Saber", "Suspended · Saber" (read once enabled), "Enabled · Saber", "Given View of 149 ·
  Saber", "View of 149 ended · Saber", "Given Plan of 149: full access to 149 · Saber", "Plan of 149 ended · Saber", "Made
  a master admin · Saber", "Master admin taken off · Saber"; a move's or an archive's end of his rights, "View of 149
  ended: you moved to 150" and "… ended: archived". Shown to him on one page with F1 and F2, not built until he answers.
- **Not in this half, named:** D2220's lines to others (Plan given told to that squadron's admins, a shared place's time
  zone changed told to the other squadron — not drawn; the page promised only the three lines of §7), filed for batch
  2's page under [MULTI-SQN-DESIGN]. The words for a place shared by three squadrons (§6 item 3) follow D2299's rule.
  Batch plan step 6 (the second demo squadron and the store's fresh start) is done already (step 4 seeded 149) and
  nothing here needs the store cleared — if the build finds otherwise, he is told before the merge (the page's promise).

## 10. Order, who builds, and the files

| Phase | Steps | Builder | Main files |
|---|---|---|---|
| 1 | A (edit rights), the spike of §3 item 5 | Opus | `state/auth.ts`, `state/perms.ts`, `state/store.ts`, the 37 caller files, `docs/data-schema.md` |
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
what the plan leaves out or gets wrong against the rulings and the code — above all step A's inventory, `saveAccess`'s
one-command rule, the bell's new audience for master admins, and the Tracker spike. Their findings and what the plan did
go in §14.
