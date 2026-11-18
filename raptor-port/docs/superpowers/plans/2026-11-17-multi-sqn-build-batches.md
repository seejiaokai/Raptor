# The multi-squadron and detachment build — the batch plan (chat 106, 17 Nov 26)

Backlog item `[MULTI-SQN-DESIGN]`. His D2187 (build now, in batches, before the database step; saves in the browser
until then), D2188 (each batch's agreed design shown again with a mock-up of just that batch before it starts), D2189
(the order is the agent's to choose). His opening message to chat 106 named an order — 1 squadrons foundation,
2 detachments, 3 Transfer to Sqn and Post out from Admin → Users, 4 borrowing and shared waves, 5 the knock-ons —
"unless the reading shows a better one". Red team: his call in that message — Astra and a fresh, blind **Fable** reader
(Fable on his word, D903, D1770), blind to each other.

The agreed design is the design note `raptor-port/docs/superpowers/specs/2026-11-16-multi-sqn-detachment-design.md`
(rounds 1–7) and the scheduler page `.claude/rules/decisions/scheduler.md` §Not built yet; People & accounts
§Many squadrons. Nothing here re-opens a ruling: where a batch needs a choice not ruled, it is listed as **open** and put
to him on that batch's page (D2188), with a recommendation.

## 1. The order, and why it differs from the one he named in one place

**Recommended: 1 foundation → 2 detachments → 3 borrowing and shared waves → 4 Transfer to Sqn and Post out from
Admin → Users → 5 what is left across batches, and the whole-app check.** His 3 and 4 swapped; nothing else moved.

- **Why transfer after borrowing.** A transfer, on its date, leaves the old squadron's lines that hold him in place —
  he becomes "a borrowed man" there (D2147: "its lines keep him as a borrowed man"). What a borrowed man is — the
  automatic "ACADEMICS · 149 / ATTACH" row on his home day (D2149), the people check across both squadrons (D2108),
  the stricter crew rest (D2161), "Take him off …" (D2114), the home bell (D2160) — is the borrowing batch. Built
  first, the transfer would either pull half of borrowing into itself or go live leaving his old lines unchecked: a man
  double-booked across the two schedules with no warning. After borrowing, the transfer is mostly the posting sheet,
  the Leave War and the people records, and it reuses the borrowed man as built.
- **Why detachments before borrowing (his order kept).** A detachment is a squadron's own second schedule at another
  place: it reuses batch 1's "a unit with its own schedule" and adds places that mean something (one man, one place).
  It needs no planning of the other squadron's people except one case — a DET onto the other squadron's open
  detachment (D2160 Q24) — where the man is at that detachment for those days, so he sits in its crew list as its own
  men do; his home schedule shows him away on DET, as a home man on DET is. No borrowed-man machinery is needed.
- **Why "knock-ons" mostly move into the batch that causes them.** Each batch goes live on its own (D1087); a feature
  live without its knock-ons is a half-working feature in front of him. So: a DET man's count rows, Insights' "249"
  and his weekly hours across every schedule, his crew rest, days in a row and long day read across places, OIL for a
  man on the other squadron's detachment, the sign-off boxes of a detachment, a DET man seeing both schedules → batch 2; OIL for a day worked for both
  squadrons, the count "2 (142) 6 (149)", the editing mark across squadrons → batch 3; a Tracker per squadron → batch 1
  (without it 149's people would mark 142's students — an access leak). Batch 5 keeps only what needs two earlier
  batches together, and the whole-app check (D490).

**The only order choice for him:** 3 ↔ 4 (recommended swap, reason above). It does not touch batch 1.

**His answer, 17 Nov 26 — "All as recommended" (batch 1's page):** the order above, borrowing before Transfer to Sqn, and 149 at Home base with batch 1's new pieces as drawn (D2190); O2–O4 as written in §3.3 — the master admin, Admin → Users by squadron, what View shows (D2191).

## 2. How each batch runs (the same for all five)

1. Its page for him (D2188): what was agreed, in plain words (D2164, D2185), each open point with a recommendation,
   pictures drawn on the real app — an approved drawing redrawn from that drawing and checked beside it (D1478), only
   what a later ruling requires changed, named and shown beside it. Wait for his look.
2. Its technical plan (this file's batch section, deepened) — the command layer over stable ids (`raptor-port/CLAUDE.md`
   §Architecture rules; `docs/undo-contract.md` §5 checklist), the table list kept true in the same change
   (`docs/data-schema.md`, `docs/data-model.md`, the permissions table §11 with `src/state/perms.ts` — D200, D473).
3. Build on its own branch, red-first tests for each rule (the behaviour register; `npm run rulecheck`).
4. The bug check by the order (`docs/bug-check-order.md`): tier stated (all five are **FULL** — each touches
   permissions or saved data or OIL), roll-call, walk sized, plain-user round (D1557), drawing check against the
   approved pictures (D1494), the two blind code reads (Astra, a fresh Opus reader — D1770), a security read wherever
   sign-in, permissions or what one person sees of another changes (D1411), evidence sheet with its `Walk:` line.
5. His look and his "merge live" — one pull request per batch; a large batch may land in two pull requests, each
   checked, if its steps are cleanly separable.

The demo data: clearing it is approved whenever it is the simpler path (D22), and a problem living only in stored data
is no finding (D56). **Batch 1 clears every browser's store once and seeds both squadrons fresh** — no conversion of
old saved records, which is where silent saved-data faults live. He is told in plain words before the merge that his
browser's demo changes go.

## 3. Batch 1 — the squadrons foundation

**What he gets:** two squadrons, 142 and 149, side by side in one app on one PC — each with its own schedule, Logic,
Leave War, Tracker, Quals and Inputs; an admin of one may be given View only of the other; a "142 ▾" button in the top
bar for anyone who may see more than one schedule; Admin → Squadrons; each place set by its time zone.

### 3.1 What it builds — the agreed lines (rulings after each)

- One app, many squadrons; the demo holds 142 and 149 [D1695, D2087]. Only a master admin makes a squadron [D2093];
  three levels of people — master admins, admins, members [D1971].
- Each person has one home squadron, set with his account; an admin adding a person picks it, his own by default
  [D1695, D2087, D2094]. He files inputs and leave only in his home squadron [D2087].
- "Request access" asks the squadron first, as drawn; the request goes to that squadron's admins only, the bell telling
  them [D2094, D2111, D1695, D216].
- Access to another squadron is View only, never as a scheduler, given on Admin → Users by that squadron's admins (or
  an admin of both), never asked at sign-up [D2094, D2160 Q5]; an admin of a squadron is made only by its own admins or
  a master admin [D2160, D2184].
- Admin gains "Squadrons", as drawn [D2110]: each squadron with its place; each place, home included, set by a time
  zone picked by name and shown as GMT+X [D2165]; a place change saved at once, no "From", counting from the next day's
  start; a place keeps its history [D2119, D2160 R7, D2184]. *(Its detachment rows are batch 2.)* *[Added 18 Nov 26 by
  his D2196: only a master admin sets the time zone of a place more than one squadron sits on.]*
- Where a person may see several schedules the TALON mark is a "149 ▾" button opening "Schedules"; Edit Schedule,
  View-only Sched, the Scheduler Board and Logic follow the pick; Inputs, Quals, the Leave War and the Tracker stay on
  his own squadron; the board's bar shows the squadron number beside its day title, small and grey [D2132]. Someone
  who may see one schedule sees no ▾ [D2132].
- Each squadron its own schedule and its own Logic settings, crew rest included, edited by its own admin [D2109,
  D2122]. Each squadron its own Tracker [D2167].
- *[SET ASIDE 18 Nov 26 by his D2195: no holiday list is shared — each squadron owns its own; the form names only its
  own published days and tells no other squadron. This line and §Public holidays below stand as first planned.]*
  Squadrons at one place share one public-holiday list, each keeping its own Off day [D2160 F1, D2184]; adding a
  holiday names, before saving, each squadron's published days it puts out of date, both squadrons' admins told; the
  admin answers the OIL question for his own squadron only, the other's schedulers for theirs [D2184 R32, narrowing
  D781].
- The print and the export carry the schedule's own number — title, heading, file name [D2184 R29, first half]. Today
  they read "142" whatever is printed.
- The table list for the IT side gains the unit (squadron; detachment from batch 2), place, time zone, and which unit
  owns each schedule day, its settings and its published versions [D2184 R35, first half; D1695's column on every
  record, IT's answer 8].

### 3.2 What it leaves for later batches

Detachments, DET, Close, one man one place (batch 2) · picking the other squadron's people, the automatic ATTACH row,
cross-squadron checks, shared waves, the grey badge, the count "2 (142) 6 (149)", OIL across both (batch 3) · Transfer
to Sqn, Post out from Admin → Users (batch 4). **A place means nothing yet in batch 1** beyond being shown and stored:
the place card's line "From tomorrow, 142 and 149 can plan each other's people" (round 7's R7D5b) promises batch 3 and
is not shown until then.

### 3.3 Open points for his batch-1 page (each with the agent's recommendation)

- **O1 — where the demo 149 sits:** at Home base with 142, as round 7's pictures have it (both "Perth · GMT+8") —
  his own example is two squadrons on one base (D2090), and the shared holiday list only shows itself there. *[Set aside by his D2195, 18 Nov 26: no holiday list is shared.]*
- **O2 — what a master admin is in the app:** a mark on an account ("Master admin"), set only by another master admin,
  acting as an admin in every squadron (D2093) and alone seeing "+ New squadron" on Admin → Squadrons, where he names
  the new squadron's first admin so it never starts with none; the demo's admin sign-in (Saber) is one, and a second
  142 admin and a 149 admin are seeded so a plain admin's view can be seen.
- **O3 — whose people an admin sees on Admin → Users:** his own squadron's people only; a man of the other squadron is
  given View of this squadron from here by search (the row shows his squadron), the rest of his row read only.
- **O4 — what a View-only person sees of the other squadron:** its schedule pages as View-only Sched shows them to a
  member, and its Logic read only; the other squadron's bell does not reach him (he is told only of his own squadron's
  things) — until borrowing, when a pick of him rings his own bell (batch 3).
- **O5 — the "149 ▾" on a phone:** the same button in the same place, the menu opening as a sheet from the top.
- **O6 — undrawn pieces drawn for the first time on the page (D1625):** the home-squadron field on New person; each
  squadron's own Off day under a shared holiday list *[set aside by his D2195: each squadron's own list]*; "+ New squadron" for a master admin; the Schedules menu with no
  detachment in it.
- **O7 — his browser's demo changes:** the store starts fresh once, both squadrons seeded (D22).
- **O8 — signing out reloads the app** (§3.4): he sees the start-up claw a moment after "Sign out" — told, not asked.

### 3.4 Architecture (the technical how — the agent's; revised after the red team, §9)

**The principle (both readers' safer foundation):** one schedule drawn on screen, one command stream, and every read
that is not "the schedule in view" asks for a named unit's records explicitly. Nothing a person's own squadron owns —
his OIL, his inputs, his Leave War, his Tracker — is ever worked out from whatever schedule happens to be in view.

**Step 0, before any code: the key inventory.** Every stored key and every module singleton listed once as *a unit's*
(schedule weeks and days, published versions, saved plans, the planning calendar rows `plan/pp:`, `plan/dm:`, Logic
`rules`, the day / wave / duty templates, the flying plan `flyday:`/`flyrule:`/`flyrun:`, Quals' columns `qualcols`,
`memberfile`, `guestview`, the change history `elog:`, the Leave War's whole world, the Tracker's whole world) or as
*the community's* (people, accounts, rights, units, places, inputs, notices and the "seen" records). The list goes into
`docs/data-schema.md` in the batch's first commit; a key on neither list fails a test.

**Identity, end to end.** A unit id is opaque and plain — `u` and base-36 letters, no hyphen, no tilde, no dot (the
demo's `u142`, `u149`) — because week ids are decoded by turning every hyphen into a slash (`persist.ts weekKey`) and
`~` already sits in published-version ids. A unit's record id is `<unit>@<its id today>` (`u149@13-07-2026`,
`u149@13-07-2026#2`, `u149@rules`); the date part is parsed only after the unit is split off. That one encoding is
carried through every layer that names a record — the change stream's records, `COMMAND_OPS` and the permission
check, revisions, the week stash, hydration, persistence, Undo's navigation — never added only at the storage edge.
Settings registration learns the unit-qualified names, so a unit's setting is written by the named settings command,
never the raw-write path.

**New tables, each by the undo-contract §5 checklist whole** (`commit()`, a `COMMAND_OPS` row, a `PERMS` row with §11
in the same change, a row mapper in `persist.ts wireRows`, a `tableOf` case): `Unit` (`id`, `num` "142", `kind`
squadron — detachment from batch 2, `parent`), `Place` (`id`, `name`, `tz` an IANA zone such as `Australia/Perth`;
GMT+X worked out for the date shown, never stored), `UnitPlace` (one row per move: unit, place, `from` — a place keeps
its history, a move counting from the next day, D2119), `Grant` (**one row per right**: account, unit, level `admin` /
`member` / `view` — not an array inside the account, so each grant is guarded and kept as its own row, the database's
shape too), and a `master` mark on the account. A person's home is `Home` rows (person, unit, `from`) — one each until
batch 4's transfer adds one; `homeOn(pid, iso)` is the one function every reader asks.
*Refined as built, step 1 (17 Nov 26 — HANDOFF's step-1 design):* the account's own `role` stays its level in its HOME
unit, so a `Grant` row (table `UnitGrant`) holds only a right in ANOTHER unit, level `admin` or `view` — no "member" of
another squadron (D2094); `levelIn(account, unit, iso)` is the one answer (master → admin; home → the role; else the
grant). Settings rows need no mapper in `persist.ts` — they are saved as every settings row is.

**The schedule in view is swapped; everything else asks by unit.**
- The scheduler's singletons (`DAYS`, `SCHED`, `DATES`, `CURWEEK`, `PLANPUCKS`, `DAYRMK`, `VCONF`/`SHIFT_HARD`, the
  `*_CFG` templates) hold the one unit in view, as they hold one week today; the "142 ▾" pick reloads them by the path
  `loadWeek` uses.
- **The week stash** (`engine/weekstash.ts`, the session's memory of every week touched) is keyed by unit and week and
  holds every unit's weeks, never only the one in view.
- **OIL never reads the schedule in view.** The Leave War's OIL pass (`leavewar/sync.ts`, its reverse sweep included)
  reads the home unit's published days through one function naming the unit; its reverse sweep covers only the records
  that unit's calculation owns. Test: switch back and forth between 142's and 149's same week many times — neither
  squadron's credits move.
- **Inputs stay one list** (one authoritative record each), but no reader loops over the whole list any more: every
  reader and writer is inventoried — the Inputs page and its calendar, the landing pass onto a day (`engine/overlay.ts`),
  a week load's landing marks, a published day's fingerprint, placeholders, notices, the Leave War's absence
  projection — and each asks `inputsFor(unit, iso…)`, an input belonging to its person's home unit on that date. Test:
  a 149 member's input filed, then switching, publishing and reloading — it never lands on 142's day. The Inputs page
  asks for the signed-in person's home unit whatever schedule is in view.
- **People:** `PEOPLE` stays one list; every *enumeration* of it (45 in 22 files today — a loop, `filter`, `map`,
  `find` over the whole list) goes through `rosterOf(unit, iso)`; a look-up by id stays. The guard test counts
  enumerations, not files: an enumeration outside `rosterOf` and an explicit allow-list (with its reason) fails it.
*Refined as built, step 3 (18 Nov 26):* `engine/roster.ts` holds `rosterOf` (and `unitPeople`, its record form), the
engine reaching `homeOn` through a resolver `state/units.ts` installs; `engine/inputs.ts inputsFor(unit, at?)` — an input
is a unit's when a man named in it is at home there on the date, a placeholder-only one its filer's. Which unit: the
schedule's readers (a day's landing, a published day's frozen copies and filing, the OIL evidence, the crew lists) ask the
unit in view; the Inputs pages, Medical, the SANS calendar and day and the OIL pass ask the signed-in person's own
(`myUnit()`, D2132). The inventory, both guard tests (`engine/roster-readers.test.ts`, `engine/inputsfor-readers.test.ts`,
counter `testing/enumguard.ts`, each red-proven): 56 walks of `PEOPLE` left in 19 files and 58 whole-list reads of the
inputs in 22, each allowed by name with its reason — storage and the seed, the deleted men stripped from every unit's weeks,
a man's own records, look-ups by id handed a record, Admin → Users and account linking (step 5, O3), and the Leave War's and
the Tracker's projections, which step 4 makes a world per unit. The OIL pass reads its unit's loaded week live only when that
unit is in view, every other week of its from the stash by qualified key, and its reverse sweep skips a man whose home that
day is another unit. A person's delete and a restore's check read every unit's stored weeks (`stashEntries`); the
restore's check had never matched a stored week at all (it read the stored text as text a second time) — fixed. Behaviour
tests, red on step 2's code: `state/units-roster.test.ts`. Left for step 4: `sansCommittedOn` and the need figures per unit,
the `missionrole:` key, other units' planning rows loaded beside the one in view.
- **Undo:** one command stream, as today; "Undo" on a schedule steps back through that person's own changes in the unit
  in view, picked from the one stream — never a separate snapshot stack per unit (D148). A change touching two units is
  one step in both.

**The Leave War and the Tracker — each a whole world per unit,** never filtered: the Leave War's keys, periods,
settings and roster under the home unit (its seams unchanged in kind, `.claude/rules/seams/leave-war.md`); the
Tracker's whole key space under the unit — courses, the chart catalogue, each chart's definition, layout and ball
details, the flex settings, its destructive sweeps (a deleted ball, a deleted chart), Import and Export, its command
permissions and Undo identities. Test: in 142 delete a ball, import a chart, change a flex setting — 149's Tracker is
unchanged, before and after signing out and in.
*Refined as built, step 4 (18 Nov 26):* neither store knows a squadron exists — each is handed a door that stores every
key under one unit (`storage/adapters.ts unitDoor`; `u149@war:2026`, `u142@v3:master:syls`), so no key of the store was
renamed and two worlds cannot meet. The Leave War loaded is the signed-in person's home unit's, swapped in at every
sign-in (`leavewar/sync.ts swapWarWorld`, its roster that unit's people); the boot seeds every squadron's first world in
its one group. The Tracker binds his unit at its first load and refuses another after that, so until the sign-out reload
(below, not built in step 4) a second person of the other squadron on the same tab keeps the first one's Tracker. Public
holidays: stored only in the war they were entered in and laid onto every squadron at the same place on that date at read
(`placeHolidaysFor`); `HOOKS.oilEarningDay` and `nonWorkingFor(unit, iso)` read through it. R32: `holidayOutOfDate`
names each squadron's published days, shown under the Holidays form before it is saved; the OIL bell line reaches each
squadron's schedulers for its own inputs only. Step 3's open items: `missionrole:` is stored per unit
(`persist.ts hydrateRolesFor`); `sansCommittedOn` and the need figures take one squadron's people; `elog:` stays
unqualified (its reader did not move). A posting's bell lines go to its own squadron's admins. The demo: 149's people
(`demoseed.ts DEMO_149_PEOPLE`), its two inputs, its week (`engine/week149.ts`), its war and one Tracker course; the
accounts `ad9`, `us9`, `ad2`. Admin → Users still lists everyone until step 5. Tests: `tracker/trk-per-unit.test.ts`,
`leavewar/holidays-by-place.test.ts`, `state/multi-sqn-step4.test.ts`.

**Signing out reloads the app.** Today signing out keeps the page, and the Leave War and the Tracker load once: a 149
man signing in after a 142 man on the same PC would get 142's. A reload at sign-out starts every world fresh for the
next person — the simplest guarantee (he sees the start-up claw a moment after "Sign out").

**Public holidays and Off days.** *[Set aside by his D2195, 18 Nov 26: each squadron owns its own list.]* The holiday list belongs to a place; each Leave War reads the list of the place its
unit is at **on that date** (a later move never rewrites past leave charges). An Off day is a dated entry, as today, kept
per unit. The OIL earning day (`HOOKS.oilEarningDay`, `sync.ts isNonWorkingISO`) reads both through one function naming
the unit. R32's warning names each squadron's published days a new holiday puts out of date.

**The first admin of a new squadron:** the master admin names him on "+ New squadron" (a squadron is never left with
no admin, D2184 Q10's rule applied from its first day). A master admin acts as an admin in every unit (D2093).

**What shows "142" today** — the TALON mark, the print's title and heading, the schedule CSV's and the LoX export's
file names — reads the unit in view (the schedule's) or the home unit (Quals' LoX).

**The store:** one schema-stamp bump clears the browser store and seeds both units (D22); `hooks.ts`'s `sqn142_`
prefix and its fixed `slice(7)` stay (the unit lives inside the record id). **The demo:** 149's people, inputs and
rows carry their own ids, never 142's handles; its own callsigns (unique in the community, D288), its own demo week on
the same dates, its own Leave War world and one Tracker course; seeded accounts for a 149 admin and a 149 member, and a
second 142 admin (the two seeded sign-ins stay as today, D166).

### 3.5 Risk and check

FULL (permissions; saved data; OIL through the holiday list). The roll-call is wide: every page that lists people, and
every place showing "142". The walk: each of the four seeded sign-ins, each squadron, desktop and phone (his iPhone —
the "149 ▾" sheet); the drawing check against round 2's Admin → Squadrons and Request access, round 3's Schedules
menu, round 4's board number, round 7's R7D1 and R7D5a (as redrawn by chat 104's F3) and R7D6.

### 3.6 Steps inside the batch (one branch, committed in order)

0. The key inventory, into `docs/data-schema.md`, with its test.
1. Units, places, homes, grants, the master mark, the permissions — no screen change; the whole unit test set green.
2. The unit-qualified identity through every layer; the schedule world under its unit; the stash by unit; the swap;
   Undo by unit from the one stream; sign-out reloads.
3. Every enumeration of `PEOPLE` through `rosterOf`, every input reader through `inputsFor`, both guard tests; the OIL
   pass on the home unit's own published days.
4. The Leave War and the Tracker, each a whole world per unit; the holiday list by place and date, Off days by unit;
   R32's warning.
5. Admin → Squadrons; Admin → Users' home squadron, View rights, admin of a unit; Request access asking the squadron;
   the "142 ▾" and Schedules menu; the board's number; print and export names.
6. The second demo squadron and the store's fresh start.
Steps 0–4 change almost nothing he sees and may land as a first pull request (with 149 seeded, so the walk can prove
the separation); steps 5–6 as a second — each FULL-checked.

## 4. Batch 2 — detachments

Create a detachment (a squadron's own admins — D2093), its short name with the faded "249" (D2116), place and dates
(round 4's fields — no editor existed); the DET input and "+ Put people on it" with the several-people picker — **one
DET per man**, filed in one go and grouped on the People list, a change touching only that man, a man already on a DET
over the dates skipped and named (D2101, D2120, D2131, D2146, R18 — R18 narrowed D2146's "one DET input");
**one man's days across every schedule he is on** — the read path batch 1's OIL function begins — so crew rest (with
the time-zone difference), days in a row, the long day and a DET's last day ending at 24:00 follow him across places
(D2092, D2109, D2165), his weekly hours on Insights counted across every schedule (Q16), and OIL for a man on the other
squadron's detachment reaching his own squadron's record by its rules (D2183's rule, Q24); a detachment's holidays its
home's, and its ALL AVAIL counting its men there (D2160); a man's own DET filed and lengthened, never shortened over a planned
day (D2184 Q20); a DET onto the other squadron's open detachment, filed by him or his own schedulers (Q24); its own
schedule, with the time zone in crew rest between places and Close keeping a day already begun there (D2165); one man,
one place — refused when planned, warned after (D2092, D2160); the Leave War's CSE · OD · DET and Days taken's DET
column (Q14, Q19); a DET man on Available but off SC DAY / SC NIGHT, and SC, AVALON, BB not plannable for him (D2168,
D2182); a SANS man's "Available for all these days" (D2169, D2182); sign-off boxes from his own squadron's qualified
people, those there first (Q13); Insights' "249" (Q16); a DET man
sees both schedules (D2180, R34); "To" a reminder, never a close (D2134); "Close detachment" with its card and
"Past detachments", closing early clearing and publishing the next amendment (D2095, D2103, D2139, D2142); a late
joiner leaves the published detachment day as it is (Q21); posting out across a DET as today, listed first (Q17);
R12–R23. Open for its page: Round 6's "does a late DET read LATE".

## 5. Batch 3 — borrowing and shared waves (may land as 3a, 3b)

**3a, borrowing:** the other squadron's free people in a group of their own at the foot of the crew lists (D2133),
picked freely where both are at one place, its SANS people included (D2091, D2145); the automatic
"ACADEMICS · 149 / ATTACH" row at home once that squadron publishes, never pending there, a later change faint beside
it, the home bell (D2149, D2160); the man's own bell and his read-only view; "Take him off …" from home (D2114); the
cross-squadron people and sim checks, sims shown with the badge (D2108, D2181; `[SIM-OVERLAP-WARN]`'s other half); a
line judged by its own schedule's Logic, the stricter crew rest across two (D2109, D2161); days in a row and Insights'
hours by his own squadron's (D2165); OIL for a day worked for both, one credit, his own squadron's values kept until it
publishes again, its card showing old and new (D2183); the count "2 (142) 6 (149)" (D2096); the hand-filed Attach as
today beside the automatic row (D2144); R24–R29; the place card's "can plan each other's people" line.
**3b, shared waves:** "Join a 149 wave" in "+ Wave" (D2106, D2126, D2130); the grey "142" badge, look 2, week and board
(D2099, D2104, D2117, D2127, D2128); a line that concerns both, editable from both (D2114); "✕ Wave" asking only with
the other's lines (D2113); the signing sentences, four (D2121, D2124, D2129); the editing mark across both and Publish
warning while the other edits (D1751, R9 — the app has no editing mark yet); "+ Line"'s "3 new ↓" (D2115, D2125,
D2137, D2138 — useful on its own; may go first); a schedule showing its own lines plus any line of a shared wave a
scheduler ticks to show (D2105); Escape closing the changes window when it was the last thing opened (D2112 — a small
fix of its own, may go any time). Open for its page: a hand Attach naming an app squadron; Fable's L9
SANS cut-off for a borrowed SANS man (round 6).

## 6. Batch 4 — Transfer to Sqn, and Post out from Admin → Users

Post out opens from Admin → Users for everyone as well as the Leave War (D2182); the "Transfer to Sqn" chip and its
fixed rules — no choices, "As of today:" lines, set months ahead, a past date refused, Undo only before the date, refused
at once where it leaves his squadron with no admin (D2136, D2147, D2160, D2162, D2163, D2184 Q10, Q18); on the date: a
member of the new squadron, his old access, admin and Scheduler tick ending, R30's ticks cleared, his old lines keeping
him as a borrowed man, both admins' bells (P15 "Posted out · now with 149"); what he carries (D2163): sign-in,
callsign, inputs, medical, currencies, leave and OIL, approved leave marked so, bids moved or waiting, quals the new
squadron does not list greyed, his Tracker course kept; a SANS man transferred still SANS (D2163; Q23's door —
Admin → Users); R31's lists. Uses batch 1's `homes` history and batch 3's borrowed man.

## 7. Batch 5 — what needs two batches, and the whole-app check

R33 (one OIL credit kept on his own squadron's record — checked whole once borrowing, detachments and transfer all
exist); the notifications register swept for every line the batches added; the table list for the IT side
finished (R35 whole), `data-model.md` §11's intro and §Squadrons' first paragraph corrected (the design note's
"stale records"); the whole-app check (D490) across both squadrons, a detachment and a transfer together.

## 8. What stays out

Caps and ops limits (paused, D2186); the database itself (D473); the aircraft-type split (`[AIRCRAFT-TYPE-SETTING]`,
settled when a second type joins); the purple names (D2100); two squadrons' ALL AVAIL at one time (D2097, no flag).

## 9. The red team (17 Nov 26) — what changed

Brief `raptor-port/docs/superpowers/briefs/2026-11-17-multi-sqn-batches-red-team.md`; reports `…-red-team-astra.md`
(5 HIGH, 1 MEDIUM) and `…-red-team-fable.md` (5 HIGH, 7 MEDIUM, 5 LOW), blind to each other, both read at commit
4a33e6930. Both upheld the order, the 3 ↔ 4 swap included, and the Tracker in batch 1. Each claim below was checked by
the host against the code or the records before it was taken; every one taken is folded into the sections above.

| Finding | Both? | Checked | Taken into |
|---|---|---|---|
| Viewing 149's week rewrites 142's OIL — the stash is keyed by bare week, the OIL pass reads it and the days in view | both (A2, F-H1) | TRUE: `weekstash.ts` one map by week; `leavewar/sync.ts` reads `stashGet` | §3.4 stash by unit, OIL on the home unit's own days, switching test |
| Inputs left unfiltered land on the other squadron's days | both (A3, F-H2) | TRUE (the landing pass loops over every input) | §3.4 `inputsFor`, the input inventory and its test |
| The Tracker shares charts, ball details and flex settings across courses | both (A1, F-H4) | TRUE: `v3:master` is one global space | §3.4 the Tracker's whole key space per unit |
| A second person's sign-in on the same PC keeps the first's Leave War and Tracker | both (A1, F-H3) | TRUE: sign-out calls `resetSession`, no reload | §3.4 sign-out reloads; O8 |
| Keys qualified only at storage leave identities shared through commands and Undo; week ids decoded hyphen by hyphen | A4 | TRUE: `persist.ts weekKey` turns every hyphen to a slash | §3.4 identity end to end, plain unit ids |
| Batch 2 live with a man's hours, rest, days in a row and OIL not read across schedules | both (A5, F-H5) | TRUE against the plan's own text | §4 the cross-schedule read path; §1, §7 |
| "One DET input for all" contradicts R18 | A6 | TRUE: round 7 H4 / R18 | §4 one DET per man |
| No list of which keys are a unit's | F-M1 | TRUE | §3.4 step 0, the key inventory |
| The people guard by file misses a new loop | F-M2 | taken as stated | §3.4 the guard counts enumerations |
| Rights as an array inside the account | F-M3 | taken | §3.4 `Grant` rows |
| A new squadron has no first admin; the master admin's reach | F-M4 | TRUE (D2093, D2184 Q10) | §3.4, O2 |
| Holiday list must be read by the place on that date | F-M5 | taken | §3.4 |
| Change history and guest switch not split | F-M6 | taken | §3.4 key inventory (`elog:`, `guestview` a unit's) |
| One Undo list per unit is under-specified | A4, F-M7 | taken in Astra's form (an admin of both, or a master admin, edits both) | §3.4 Undo from the one stream |
| Demo ids collide; `~` already used; Off day is dated, not a weekday; D2112, D2105, a detachment's holidays and ALL AVAIL in no batch; the holiday move as its own pull request | F-LOW | TRUE (the drawing helper found the Off day shape too) | §3.4, §4, §5, §3.6 |
