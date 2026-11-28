# "What each role allows" — the table, checked (D2302); approved as drawn 22 Nov 26 (D2305)

Checked 22 Nov 26 against the rulings pages, their full rows, and the code on branch `claude/msq-b1-screens-135`.
Paths below are under `raptor-port/src/` unless they start with `.claude/`.

## 1. The table

| Page | Member | Admin | View | Plan | Master admin |
|---|---|---|---|---|---|
| Edit Schedule | — | ✓ | — | ✓ | ✓ |
| View-only Sched | read | read | read | read | read |
| Logic | read | ✓ | read | ✓ | ✓ |
| Inputs | ✓¹ | ✓ | — | ✓ | ✓ |
| Quals | ✓² | ✓ | — | ✓ | ✓ |
| Leave War | ✓³ | ✓ | — | ✓ | ✓ |
| Tracker | ✓⁴ | ✓ | — | ✓ | ✓ |
| Admin | — | ✓⁵ | — | ✓⁵ | ✓ |

✓ can change · read = can see, not change · — cannot open

Notes
1. Inputs: his own, and duties and commitments for others. Sees everyone's.
2. Quals: his own row only — not his callsign, Management or Scheduler tick.
3. Leave War: bids on his own row on open dates, his own balances until locked. Sees everyone's.
4. Tracker: everything but the flex settings.
5. Admin: only a master admin makes squadrons, gives Plan and makes master admins.
6. View and Plan are of another squadron. Member and Admin are of his own.

(Column heads in full, if the width allows: "View of a squadron", "Plan of a squadron". Note 6 has no cell
number — it explains the two columns; it could be the label above the table instead, see Words.)

## 2. Proof — every cell

Member = a member in his own squadron. Admin = an admin in his own squadron. View / Plan = what that access gives of
the OTHER squadron. Master admin = any squadron.

### Edit Schedule
- Member —: the tab is hidden unless admin (`ui/Shell.tsx:390`, `ui/Drawer.tsx:27`); a non-admin found on it is sent to View-only Sched (`state/store.ts:550`, `:562`); no schedule write (`state/perms.ts:124`, member reads only); D292 ("no Edit Schedule" in the member view); scheduler page line 299 (the page itself refuses a member); D1658.
- Admin ✓: `state/perms.ts:124` (admin C R U D), `:317` mayEditSched; D785 (a scheduler is always an admin).
- View —: D2252 ("sees only its View-only Sched and Logic, read only"); D2191 point 6 ("as a member sees View-only Sched"); D2253's reading (Edit Schedule lands him on View-only Sched). Code: `state/perms.ts:303` adminOfPage — a View holder is never offered the other squadron's edit controls; test `state/page-unit.test.ts:50`. NOT YET WIRED to the page — see Conflicts 3.
- Plan ✓: D2201 ("full access to everything"), D2211 ("its schedule and publishing"); `state/perms.ts:303–308` (level admin in the picked squadron); test `state/page-unit.test.ts:23`.
- Master admin ✓: D2197 ("full editing rights of all pages"), D2191; `state/perms.ts:283`; test `state/page-unit.test.ts:19`.

### View-only Sched
- Member read: `ui/Drawer.tsx:27` (open to all); the page is drawn as a picture of the day with no editing control (`ui/ViewWeek.tsx`, whole file — it imports no writer); scheduler page lines 415, 423, 425 (D95, D169, D338 — sees sign-offs and the full change history, read only).
- Admin read: same page, same file; scheduler page line 438 (D1647 — "the plain read-only list for everyone, an admin included"); editing is on Edit Schedule and the Scheduler Board only.
- View read: D2252, D2191; `state/perms.ts:278` pageUnit('schedule') follows the pick; test `state/page-unit.test.ts:23–30`.
- Plan read: as Admin, of that squadron (D2201; D1647).
- Master admin read: as Admin, any squadron (D2197; D1647).

### Logic
- Member read: `ui/Drawer.tsx:28` (open to all); editing needs the schedule right (`state/auth.ts:42` lgCanEdit; `ui/LogicPage.tsx:329, 351, 371, 379, 447` each return unless admin); settings are an admin's (`state/perms.ts:119`); scheduler page line 105 (D925 — written so a member understands it).
- Admin ✓: `state/auth.ts:42`, `state/perms.ts:119` (admin C R U D on settings).
- View read: D2252, D2191 ("its schedule pages and Logic read only"); `state/perms.ts:267–278` (Logic is a 'schedule' page, follows the pick); `:303` (no edit for a View holder).
- Plan ✓: D2201 (sets aside the agent's table that had Logic read only — "every page, each his to edit, its settings … among them"), D2211 ("its settings").
- Master admin ✓: D2197 ("the schedule pages and Logic … each edited as that squadron's own admins edit it").

### Inputs (with its SANS and Medical tabs)
- Member ✓¹: `state/perms.ts:138` (reads all, creates/changes/deletes his own); files for another man only a duty or commitment while the squadron's switch is on (`state/perms.ts:337`, `:392–397`, `:445`); inputs page line 72 (D655, D658, D763 — "never leave, never medical, never SANS availability"); sees everyone's: `ui/InputsPage.tsx:213–216` ("Everyone" one pick away), D211 (every member reads a medical input in full). Tests `state/perms.test.ts:157, 175, 185, 193`; `ui/memberinput.test.tsx:80, 87`. Settings gear admin only (`ui/InputsPage.tsx:668`, `ui/SansCal.tsx:305`).
- Admin ✓: `state/perms.ts:138` (admin C R U D); test `state/perms.test.ts:175` ("an admin anyone, any kind").
- View —: D2252 ("never its Inputs, Quals, Leave War or Tracker, even read only"); `state/perms.ts:278–285` (own pages stay his own squadron's for a View holder); test `state/page-unit.test.ts:23–30`.
- Plan ✓: D2201; `state/perms.ts:283`; test `state/page-unit.test.ts:23`.
- Master admin ✓: D2197 (names Inputs); `state/perms.ts:283`; test `state/page-unit.test.ts:19`.

### Quals
- Member ✓²: D149 (his own row, everything in it), narrowed by D218 (callsign), D1510 (Management), D1651 (Scheduler); `state/perms.ts:116` (reads all, updates own), `:455`, `:466–473`, `:479–490`; `ui/QualsPage.tsx:235, 264`; tests `state/perms.test.ts:110, 372`.
- Admin ✓: `state/perms.ts:116` (admin C R U D), `:455–463` (every row of his own squadron).
- View —: D2252; `state/perms.ts:278–285`; `ui/QualsPage.tsx:78` (Quals stays on his own squadron).
- Plan ✓: D2201; `state/perms.ts:457–463` ("an admin grant there").
- Master admin ✓: D2197 (names Quals); `state/perms.ts:457–463` ("or the master mark").

### Leave War (Grid, Balances, OIL; Approvals for an admin)
- Member ✓³: `leavewar/engine/access.ts:37–41` (a member only on an open day from today), `:53–55` (his own row only), `:59–61` (deciding is the admin's); `state/perms.ts:141` (bids: reads all, writes own), `:152` (balances: reads all, types his own), `:147–148` (OIL read); leave-war page lines 29 (D1177), 46 (D1211), 77 and 79 (D1185, D1203, D1242 — own balances, every kind but OIL, until locked; everyone else's read only), 174 (D1254 — no Approvals tab for a member); OIL page line 75 (D1008, D1209). Test `state/perms.test.ts:420`.
- Admin ✓: `leavewar/engine/access.ts:39, 54, 60`; `state/perms.ts:140–152` (admin C R U D).
- View —: D2252 (its reason: the war shows every man's leave and balances); `state/perms.ts:278–285`.
- Plan ✓: D2201 (sets aside "the leave pages read only").
- Master admin ✓: D2197 (names the Leave War).

### Tracker
- Member ✓⁴: D121 ("admin and member should have the same access authority", the File menu too), narrowed by D1014 (flex settings an admin's), D1018 (a member sees them read only); `state/perms.ts:156` (member C R U D), `:631–635`, `:638` (flex is a setting — the admin's); `tracker/role.js` (the one admin gate); tests `state/perms.test.ts:426, 430`, `tracker/trk-flex-setting.test.tsx`.
- Admin ✓: `state/perms.ts:156`, `:638`; D1014.
- View —: D2252 ("the Tracker has no read-only mode"); `tracker/peoplewire.ts:123` (reads the own-page squadron).
- Plan ✓: D2201 (sets aside "Tracker … hidden").
- Master admin ✓: D2197 (names the Tracker); test `state/msq-fix2-tracker-moved-master.test.tsx`.

### Admin
- Member —: tab hidden unless admin (`ui/Shell.tsx:416`, `ui/Drawer.tsx:34`); sent off it (`state/store.ts:550, 562`); accounts not his (`state/perms.ts:121`, `:496`); scheduler page line 299 ("the page itself refuses a member"); D292 ("no Admin tab").
- Admin ✓⁵: `state/perms.ts:119, 121` (settings, accounts); D1971 (admins create accounts and set rights); D2192 (makes admins of his own squadron only). What is left out: making a squadron and making a master admin (`state/perms.ts:713, 729`, `:2587`, `:2653`; test `state/units.test.ts:146`; D2191); giving Plan (D2199, D2201 — a master admin's alone; `state/perms.ts:2164, 2620`); changing a master admin's account (D2205; `state/perms.ts:2336`).
- View —: D2252 / D2191 (schedule pages and Logic only; of his row "nothing else changeable"); `state/perms.ts:278–285` (Admin → Users is an own page).
- Plan ✓⁵: D2201 ("its settings and Admin → Users among them"), D2211 ("its people and their sign-ins"); same three things left to a master admin (D2199, D2191; `state/perms.ts:713–729` asks the master mark, not Plan).
- Master admin ✓: D2191 (makes squadrons, names first admins, makes master admins), D2197 (Admin → Users follows his pick), D2199 (gives Plan); `state/perms.ts:729`.

### The notes
- Note 1: inputs page line 72 (D655, D658, D763); `state/perms.ts:337, 392–397, 445`; `ui/InputsPage.tsx:213–216`.
- Note 2: D149, D218, D1510, D1651; `state/perms.ts:466–473`.
- Note 3: D1177, D1211, D1203, D1242, D1008; `leavewar/engine/access.ts:37–61`.
- Note 4: D121, D1014; `state/perms.ts:638`.
- Note 5: D2191, D2199, D2201; `state/perms.ts:713`.
- Note 6: D2191, D2201, D2252, D2253 (a person holds one access to another squadron: none, View or Plan).

## 3. Conflicts and things not settled

1. **"A member sees only his own" on Inputs and Quals (said to him in D2252's reasons; D292's row says "his own Quals row and inputs only") against the app and the permissions table.** The app shows a member everyone's inputs ("Everyone" one pick away — `ui/InputsPage.tsx:213–216`; `state/perms.ts:138` reads all; D211 has every member reading medical inputs in full) and every Quals row read only (`state/perms.ts:116`). He CHANGES only his own; he SEES everyone's. The rulings page already softened it to "mostly his own". The table follows the app and D211 / D655; D2252's ruling itself (View never reaches those pages) is not affected, but one reason he was given was overstated. For him to know, not a cell to bend.
2. **Note 1's switch.** A member files duties and commitments for others only while his squadron's admin has left that on in the Inputs settings (it starts on — `state/perms.ts:445`). The note leaves the switch out to stay one line. If he wants it said: "…for others (unless the admin has switched that off)".
3. **View and Edit Schedule: ruled, coded, not yet connected.** The rulings say a View holder never gets the other squadron's Edit Schedule (D2252, D2191, D2253's reading). The check exists (`state/perms.ts:303–308`, tested) but the page's many edit controls still ask the old question; the code's own comment says they move across with the "Schedules" menu. Nobody can reach another squadron on screen until that menu is built, so no harm today — but when the menu ships, an admin of 142 holding only View of 149 must be kept off 149's Edit Schedule. A build item, not a table change.
4. **"Its schedule pages" (D2191) against "only its View-only Sched and Logic" (D2252).** D2191 says View shows the other squadron's "schedule pages", plural; D2252, later, names View-only Sched alone. The later one wins (D90) and D2191's own point 6 says "as a member sees View-only Sched", so the Edit Schedule cell is "—". Listed because the two wordings differ.
5. **Plan and Master admin in the member view.** By D2253, after tapping his name badge to the member view, a Plan holder or master admin has only View of the other squadrons. The table shows the role in force and does not say this. Left out to keep six notes; add only if he wants it.
6. **Left off the table on purpose:** Help (everyone opens it and may report a problem; admins see every report — `ui/HelpPage.tsx:52–99`), the bell, the Scheduler Board (part of Edit Schedule) and Insights (a menu on both schedule pages). None is a page a role is kept off, apart from the board, which rides Edit Schedule's row.
7. **Not checked by pressing anything.** Every cell is proved from a ruling or the code and its tests; nothing here was walked in the running app. The View and Plan columns and the master admin's reach into other squadrons cannot be walked yet — the "Schedules" menu is not on screen.

## 4. Words

- Label above the table: "View and Plan are access to another squadron." — then note 6 can go, leaving five notes. Recommended.
- Legend line under the grid: "✓ can change · read = can see · — cannot open".
- Column heads at 402 px: "Member", "Admin", "View", "Plan", "Master admin" (two lines: "Master / admin"). "of a squadron" does not fit five role columns; the label above carries it.
- The fold's title: keep "What each role allows".
