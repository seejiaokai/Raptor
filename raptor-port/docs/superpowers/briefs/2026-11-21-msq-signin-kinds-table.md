# Every kind of sign-in against every door — the table from his rulings (D2259)

Written 21 Nov 26 by a fresh Fable reader, from the rulings pages, their full rows, `data-model.md` §11 and
`ui-contracts.md` only — **before** reading the gate's code (`src/state/perms.ts`) or any door function. Part 2 of the
job checks each cell against the real guard; its results are in the reader's report and in the committed tests
`src/state/signin-kinds-*.test.ts`, not here. Filed under `[MSQ-FABLE-REVIEW]`.

## How to read it

- **E** = may change it. **V** = may see it, never change it. **–** = neither sees nor changes it.
- **own** = in his own (primary) squadron. **other** = in the other squadron (142 for a 149 person, 149 for a 142 person).
- A number in brackets is the ruling the cell rests on. **(reading)** marks a cell no ruling settles — the agent's
  reading, to be put to him, never his rule.
- "Refused for everyone" rules (the last admin, his own account row, moving himself) are listed under the table; they
  cut across every kind.

## The kinds

| Code | Kind | In the test world |
|---|---|---|
| MA | a master admin | Saber, home 142 |
| AD | a squadron's admin, at home, holding nothing of the other | Hunter (142); Kestrel (149's only admin) |
| PL | an admin of 142 holding **Plan** of 149 | Hunter given Plan of 149 |
| VA | an admin of 142 holding **View** of 149 | Hunter given View of 149 |
| ME | a member holding nothing of the other | Ranger (142), Osprey (149) |
| VM | a member holding View of the other squadron — the rulings allow it (D1695, D2191 point 5: a 149 admin gives a 142 man View of 149) | Ranger given View of 149 |
| WA | a person waiting for access | a sign-in on no list |
| OFF | a suspended account, or an archived or deleted man's account | — |
| MV− | a man who moves 142 → 149, the day before his move | Ranger, `moveMan` |
| MV+ | the same man on his move day and after | the same |
| MVA | an admin who moved 142 → 149, on his move day and after | Hunter moved |

What the rulings fix for whole kinds, so the table need not repeat it in every cell:

- **MA** edits every page of every squadron, each as that squadron's own admins do (D2191, D2197). His own inputs and
  leave stay filed in 142 (D1695, D2197).
- **PL** has, in 149, everything 149's own admins have — every page, its settings, its people and their sign-ins
  (D2201, D2211) — and wherever a master admin may act for 149, so may he (D2241). Four things stay outside it: giving
  or taking Plan (a master admin's alone, D2199 — but his own squadron's admin may make him a member, ending it, D2250);
  making or unmaking a master admin, and changing a master admin's account (D2192, D2205); making a squadron (D2191);
  counting as 149's last admin while 149 has an admin of its own (D2247).
- **VA / VM**: View shows the other squadron's View-only Sched and Logic, read only — never its Inputs, Quals, Leave
  War, Tracker or bell, even read only (D2191, D2252). A View right writes nothing (§11).
- **AD / ME** with nothing of the other squadron see and change nothing of it (D2192, D2252).
- **WA** sees only the waiting screen (D2239). **OFF** cannot sign in and "reads and writes nothing" (D280, §11).
- **MV+**: his View and Plan ended at the start of his move day (D2203, D2243); he is a member of 149 from that day
  and nothing in 142. **MVA** joins 149 as a member; his admin rights and Scheduler tick in 142 end on the date
  (D2147, D2136). **MV−** is still wholly 142's — a plain ME of 142.
- A scheduler is always an admin (D785): no cell is written for a scheduler who is not one.
- In the member view an admin is a member for as long as it is on (D292, D785); a PL or MA there is a member of his own
  squadron with View of what he could edit (D2253).

## The table

Each cell reads **own / other**. MV− is a 142 member in every cell (as ME) and is left out. For MV+ and MVA "own" is
149 (the new squadron) and "other" is 142 (the old one).

### The schedule

| # | Door | MA | AD | PL | VA | ME | VM | WA | OFF | MV+ | MVA |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Edit Schedule — the week's cells, the day panel, crew, times, remarks | E / E (D2197) | E / – (D2192) | E / E (D2201) | E / – (View writes nothing, §11) | – / – (D1658, the page refuses a member) | – / – | – / – | – / – | – / – | – / – (D2147) |
| 2 | Sign-off boxes — ticking a box on a day | E / E | E / – | E / E | E / – | – / – | – / – | – / – | – / – | – / – | – / – |
| 2a | Being OFFERED in a squadron's SKED CK, PLANNED BY, APPROVED BY | own: by the day's people rule / other: yes, after the day's own, if he carries the Scheduler tick (D2245) | own / never | own / yes, after the day's own, with the tick, while his Plan holds that day (D2245) | own / never | by the day's people rule / never | same | never | never | 149's from the move day; 142's boxes offer that day's people (D2243 Q2) | same; his Scheduler tick in 142 ended (D2147) |
| 2b | Being offered in CUR CK | the squadron's own people of that day only (D2245) — MA and PL never in 149's | | | | | | | | | |
| 3 | Publish, amend, unpublish | E / E | E / – | E / E (D2201, D2211 "its schedule and publishing") | E / – | – / – | – / – | – / – | – / – | – / – | – / – |
| 4 | Saved plans, templates, Days… (the planning calendar) | E / E | E / – | E / E | E / – | – / – | – / – | – / – | – / – | – / – | – / – |
| 5 | Logic — its settings | E / E (D2197) | E / – | E / E (D2201 "its settings") | E / V (D2191) | V / – (D925) | V / V (D2191, D2252) | – / – | – / – | V / – | V / – |
| 6 | The schedule as viewed (View-only Sched), the Signed line, the Traffic list | V / V | V / – | V / V | V / V (D2191) | V / – | V / V (D2191) | – / – (D2239) | – / – | V / – (D2203, D2243) | V / – |
| 7 | The day lock — taking, releasing, taking over a day | E / E | E / – | E / E | E / – | – / – | – / – | – / – | – / – | – / – | – / – |
| 8 | Scheduler notes, "Make public", the late-input mark's drop | E / E | E / – | E / E | E / – | – / – (D1586: a scheduler's) | – / – | – / – | – / – | – / – | – / – |
| 9 | Blue / red role answers (Insights' mission roles) | E / E | E / – | E / E | E / – | V / – (§11 `MissionRoleAnswer`) | V / – | – / – | – / – | V / – | V / – |

### Inputs, Quals, medical, SANS

| # | Door | MA | AD | PL | VA | ME | VM | WA | OFF | MV+ | MVA |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 10 | Inputs list and calendar — seeing them | V / V (D2197) | V / – | V / V (D2201) | V / – (D2252) | V own squadron's / – | V / – (D2252) | – / – | – / – | V 149's / – | V 149's / – |
| 11 | His OWN input — file, change, delete, take himself out | E, filed in 142 (D1695, D2197) / never filed in 149 | E / – | E, filed in 142 (D2201 reading) / never in 149 | E / – | E (D655) / – | E / – (D1695 "filing inputs and leave only in his primary") | – | – | E in 149 from the move day / an input wholly on his 142 days: E as its only person (reading); one spanning the move: E, the man himself (§11, D2240) | same |
| 12 | Filing or changing ANOTHER person's input | E / E | E / – | E / E | E / – | E only a duty or commitment he filed, the switch on, people of his own squadron; never leave, medical, SANS availability (D655, D658, D763) / – | same / – | – | – | as ME in 149 / – in 142 (a moved filer is told only as an admin again, D2228; changing it: reading –) | as ME / – |
| 13 | Where an input goes (Reject, → Ground, → Unavail), the CX on its row, dropping people on its row | E / E | E / – | E / E | E / – | – / – (D1388, D755: the scheduler's) | – / – | – | – | – / – | – / – |
| 14 | Calendar notes and titles on the Inputs calendar | E / E | E / – | E / E | E / – | V / – (reading: a scheduler's note) | V / – | – | – | V / – | V / – |
| 15 | Inputs settings — members-file-for-others, the late cut-offs | E / E | E / – | E / E | E / – | V / – (§11 `Setting`) | V / – | – | – | V / – | V / – |
| 16 | Medical inputs and upchits | E / E | E / – | E / E | E / – | E his own; V every member's type, remarks, documents (D211) / – | same / – (D2252) | – | – | as ME in 149 / – | as ME / – |
| 17 | Quals — a row | E every row / E | E every row of his squadron / – (reads only, §11) | E / E (D2201) | E / – (D2252) | E his own row but callsign, Management, Scheduler; V the rest (D149, D218, D1510, D1651) / – | same / – (D2252) | – | – | his own row, now 149's / – | same — and his Scheduler tick no longer his to tick |
| 18 | Quals — rename a callsign, the Management and Scheduler ticks, Edit quals (the columns) | E / E | E / – | E / E | E / – | – / – | – / – | – | – | – / – | – / – |
| 19 | SANS calendar — seeing it, adding his own commitment | E / E | E / – | E / E | E / – | V, E his own commitment (D569–D618) / – | same / – | – | – | as ME in 149 / – | as ME / – |
| 20 | SANS calendar settings (its three colours), the flying plan (Required, day classes) | E / E | E / – | E / E | E / – | V / – (§11 `Setting`) | V / – | – | – | V / – | V / – |

### The Leave War and OIL

| # | Door | MA | AD | PL | VA | ME | VM | WA | OFF | MV+ | MVA |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 21 | Seeing the grid, Balances, the OIL tracker | V / V | V / – | V / V | V / – (D2252) | V own squadron's, every man's (D1008, D1242) / – | V / – (D2252) | – | – | V 149's / – | V 149's / – |
| 22 | His OWN bid — place, move, delete; an overseas duty or course on his own row | E, in 142's war (D1695) / never in 149's | E / – | E in 142's / never in 149's (D2201 reading) | E / – | E on a day open for bidding, not before today (D1177, D1211) / – | E / – (D1695) | – | – | E in 149's from the move day / – in 142's for a day after his move, for everyone (D2243 Q3); removing his own there never refused | same |
| 23 | Another man's entry — place, change, move, delete; "Approve what I enter"; UNA | E / E | E / – | E / E | E / – | – / – (§11 `LeaveBid`; D1338) | – / – | – | – | – / – | – / – |
| 23a | A moved man's leave across his move | each squadron's admin for its own days (D2221) — until the Transfer batch only the man, a master admin, or an admin of both, at home or by Plan (D2240) | 142's AD alone: – for now (D2240) | E (admin of both) | – | – | – | – | – | E his own (D2240) | E his own |
| 24 | Approve, refuse, back to bid | E / E | E / – | E / E | E / – | – / – | – / – | – | – | – / – | – / – |
| 25 | Settings (groups, counters, order), "Open for bidding", + New period | E / E | E / – | E / E | E / – | – / – (D1499, D1177, D1141) | – / – | – | – | – / – | – / – |
| 26 | Holidays, Off days, Events | E / E — each squadron's own list (D2195) | E / – | E / E | E / – | V / – | V / – | – | – | V / – | V / – |
| 27 | Postings — Post out, Post in, Undo post out | E / E; a master admin's Overseas posting only by a master admin, a Delete posting for one by nobody (§11) | E / – | E / E (D2241), the master-admin limits holding against him (D2205) | E / – | – / – (D328: the admin's, never the man's) | – / – | – | – | – / – | – / – |
| 28 | OIL — Grant OIL, credits, a correction, OIL Earn's switches | E / E | E / – | E / E | E / – | V; opens his own award read only (D261, D1008, D1209) / – | V / – | – | – | V 149's / – | V 149's / – |
| 29 | Balances — figures | E every row / E | E every row / – | E / E | E / – | E his own row while unlocked, never OIL; V the rest (D1203, D1220, D1209) / – | same / – | – | – | his own row in 149's / – | same |
| 30 | Balances — grades, "Lock for members" | E / E | E / – | E / E | E / – | – / – (D1487) | – / – | – | – | – / – | – / – |

### The Tracker

| # | Door | MA | AD | PL | VA | ME | VM | WA | OFF | MV+ | MVA |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 31 | Entries, the chart editor, Import / Export | E / E (D2197) | E / – (D2167: each squadron its own Tracker) | E / E (D2201) | E / – (D2252) | E (D121, D1014 — a member does all an admin does) / – | E / – (D2252) | – | – | E 149's from the move day / – 142's (D2243 Q7's band) | same |
| 32 | The flex settings | E / E | E / – | E / E | E / – | – / – (D1014) | – / – | – | – | – / – | – / – |

### Admin

| # | Door | MA | AD | PL | VA | ME | VM | WA | OFF | MV+ | MVA |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 33 | Admin → Users — seeing the list | V every squadron's, by the Schedules pick (D2197) | V his own squadron's; a man of the other only by search, to give View (D2191) | V 142's and 149's (D2201, D2211) | V his own | – (the page refuses a member) | – | – | – | – | – |
| 34 | Add a person, give access (approve / decline a request), New person | E / E | E, the new man his own squadron's (§11) / – | E / E | E / – | – / – | – / – | may ask once (D204) | – | – / – | – / – |
| 35 | A person's role — admin ⇄ member | E / E | E his own squadron's people only (D2192) / – | E / E — may make a 149 man an admin of 149 (D2201, D2241) | E / – | – / – | – / – | – | – | – / – | – / – |
| 36 | Suspend, Enable, Archive, Restore, Restore as, Delete, re-link a sign-in | E / E | E / – ("He is 149's. Only an admin of 149 can change his account.", D2205) | E / E (D2205's reading: a Plan holder counts as "an admin of 149") | E / – | – / – | – / – | – | – | – / – | – / – |
| 37 | A MASTER ADMIN's account — role, sign-in, callsign, suspend, archive, restore; the master admin mark | E (never his own; one master admin always remains; never deleted) | – (D2205) | – (D2205 "holds against a planner too") | – | – | – | – | – | – | – |
| 38 | Give / take **View** of a squadron | E / E | E: gives a man of the other squadron View of HIS OWN squadron (D2191 point 5) / never View of the other | E both ways (reading of D2201: he acts as 149's admin) | as AD | – / – | – / – | – | – | – / – | – / – |
| 39 | Give / take **Plan** | E (D2199: a master admin's alone) | – ; but may make his own squadron's Plan holder a member, his Plan ending with it (D2250) | – ; D2250 the same | – | – | – | – | – | – | – |
| 40 | Move a person to another squadron | E, never himself (D2249) | E a man of his own squadron, out of it (§11: admin of the squadron he leaves); never himself; never a master admin (D2249) | E a 142 or a 149 man; never himself; never a master admin | as AD | – | – | – | – | – | – |
| 41 | "+ New squadron", a squadron's number and kind | E (D2191) | – | – (D2191: only a master admin makes squadrons) | – | – | – | – | – | – | – |
| 42 | Squadron config — the place and its time zone, Off days, Home squadron | E / E; a place two squadrons sit on: a master admin alone (D2196) | E his own, never a shared place's time zone (D2196) / – | E / E, never a shared place's time zone (D2196 — reading: Plan is not master) | E / – | – / – | – / – | – | – | – / – | – / – |
| 43 | Admin → Data — exports, "Clear old clutter", "Clear edit history…" | E / E | E his own squadron's / – | E / E | E / – | – / – | – / – | – | – | – / – | – / – |

### Across the app

| # | Door | MA | AD | PL | VA | ME | VM | WA | OFF | MV+ | MVA |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 44 | The bell — whose lines reach him | 142's by default; other squadrons' off, his to switch on (D2198) | his own squadron's admin lines and his own | 142's, and 149's admin lines, on by default, each marked with its squadron (D2202) | his own squadron's only — View never carries the other's bell (D2191) | his own lines | his own only (D2191) | none | none | 142's lines left on his move day; lines about himself follow him (D2218, D2222) | same |
| 45 | Marking bell lines read, "Mark all as seen" in the history | E his own record only (§11 `NoticeSeen`, `EditLogSeen` own) | same | same | same | same | same | – | – | same | same |
| 46 | The changes window and History | V / V | V / – | V / V | V / V (reading: the history is part of the schedule pages View shows, D169, D2191) | V, read only, the To go out tab too (D169, D338) / – | V / V (reading, as VA) | – | – | V 149's / – | V 149's / – |
| 47 | Undo / Redo | E — his own changes only, in the squadron each was made in (D148) | E his own changes, his own squadron | E his own changes in 142 and 149 | E his own in 142; nothing to undo in 149 — he wrote nothing there | E his own changes only (D148) | same; nothing in the other | – | – | his own changes made in 149; an Undo that would write into 142 after his move day: refused (D2249's reason, D2243 Q3 — reading for anything but leave) | same; an Undo of his own 142 ADMIN steps after his move: refused (reading: his admin rights there ended, D2147) |
| 48 | Undo after a right ENDED — Plan taken back, made a member, suspended | — | an Undo or Redo is a new change and needs today's right (reading; D148 gives only "his own changes", never a right he no longer holds) | same: after Plan ends, his Undo of a 149 step is refused (reading) | — | — | — | — | — | — | — |
| 49 | Insights | V / V (D2197) | V / – | V / V (D2201) | V / – (reading: not a schedule page or Logic, D2191) | V own squadron's (reading — no ruling found on a member's Insights) / – | V / – | – | – | V 149's / – | V 149's / – |
| 50 | Export and print of a schedule | E / E | E / – | E / E | E / V-only export of the published 149 schedule he may read (reading) | V: the schedule he may read (reading) / – | same / as VA (reading) | – | – | 149's / – | 149's / – |
| 51 | The name-badge switch to the member view | becomes a 142 member with View of every squadron he could edit (D2253) | becomes a member (D292) | a 142 member with View of 149 (D2253) | a member, View of 149 kept (reading) | — | — | — | — | — | — |

## Rules that cut across every kind

1. **The last admin.** No step by anyone, a master admin included, leaves a squadron with no admin able to sign in; where
   a squadron has an admin of its own a Plan holder never counts for it; the refusal names who can fix it (D306, D2184,
   D2246, D2247).
2. **His own account.** Nobody opens, changes or deletes his own account row; another admin does (D322, §11).
3. **Nobody moves himself; only a master admin moves a master admin** (D2249).
4. **Only a master admin makes or unmakes a master admin, and one always remains** (D2192, D2205, §11).
5. **A member never changes another person's record or a scheduler's mark** — the one exception is the group duty he
   filed himself while the switch is on, and taking himself out of an input (D655, D755, D763).
6. **A right that has ended gives nothing** — a View or Plan after his move, an account suspended, a role lowered —
   through any door, a stored Undo step and a hand-made command included (D2203, D2243, §11 "A View grant writes
   nothing", "An account switched off reads and writes nothing").

## Where §11 or a contract differs from a ruling (found while writing — the ruling wins)

- **§11's roles paragraph still says "one business unit (single tenant — one squadron, one environment, no
  cross-squadron rows)".** His D1695 and D2191 make it many squadrons in one database; the table's own later paragraphs
  ("Every unit's record is judged in its own unit") already say so. A stale sentence, not a rule.
- **§11 `Unit` row gives a Pending person R** ("so a pending person's screen can name theirs"). D2239: he sees only the
  waiting screen. Reading the list of squadrons to name his own is not "the programme", so no clash in what he sees —
  noted because the cell is not "—" as every other Pending cell is.
- **§11 `UnitGrant` row says a right is "`admin` or `view`".** His word for the first is **Plan** (D2199, D2201,
  D2211) and it is given to an admin only (D2250: "only an admin holds Plan"). §11 does not say there that a Plan
  right may be held only by an account whose own role is admin.
- **§11 `Place` row: "any admin makes one"**, and a shared place's time zone "narrowed … by his D2196 … to build, chat
  109" — the document itself says the app does not yet hold D2196. Checked in Part 2.
- **§11's inputs paragraph: an input spanning a man's move "is changed only by the man himself or an admin of every
  squadron it touches".** His D2221 says each squadron's admin changes the leave for its own days; §11 states the
  stop-gap (D2240) and files the rest to the Transfer batch. A known, filed difference.
- **§11 `Course …` row: "everyone edits the Tracker".** Since D2252 that is everyone *of that squadron* (and a master
  admin or Plan holder); the squadron rule is stated only in the later paragraph "The Tracker".
- **§11 `EditLog` row gives a member "C R"** and "members read it" with no squadron named; D2252 keeps another
  squadron's pages from a View holder but says nothing of its history. Marked a reading in door 46.
- **D2191 says of a man of the other squadron on Admin → Users: "found by search there to be given View, nothing else
  of his row changeable".** §11 has no line for who may give View (it says only that Plan is a master admin's); the
  giver of View is checked in Part 2.
- **`ui-contracts.md` line 5220 region ("An admin in the member view is a member here")** agrees with D292; nothing in
  the contracts names a Plan holder's or master admin's member view (D2253) — that ruling says "not yet reachable on
  screen".
