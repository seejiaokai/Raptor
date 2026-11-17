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
  live without its knock-ons is a half-working feature in front of him. So: a DET man's count rows, Insights' "249",
  the sign-off boxes of a detachment, a DET man seeing both schedules → batch 2; OIL for a day worked for both
  squadrons, the count "2 (142) 6 (149)", the editing mark across squadrons → batch 3; a Tracker per squadron → batch 1
  (without it 149's people would mark 142's students — an access leak). Batch 5 keeps only what needs two earlier
  batches together, and the whole-app check (D490).

**The only order choice for him:** 3 ↔ 4 (recommended swap, reason above). It does not touch batch 1.

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
  start; a place keeps its history [D2119, D2160 R7, D2184]. *(Its detachment rows are batch 2.)*
- Where a person may see several schedules the TALON mark is a "149 ▾" button opening "Schedules"; Edit Schedule,
  View-only Sched, the Scheduler Board and Logic follow the pick; Inputs, Quals, the Leave War and the Tracker stay on
  his own squadron; the board's bar shows the squadron number beside its day title, small and grey [D2132]. Someone
  who may see one schedule sees no ▾ [D2132].
- Each squadron its own schedule and its own Logic settings, crew rest included, edited by its own admin [D2109,
  D2122]. Each squadron its own Tracker [D2167].
- Squadrons at one place share one public-holiday list, each keeping its own Off day [D2160 F1, D2184]; adding a
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
  his own example is two squadrons on one base (D2090), and the shared holiday list only shows itself there.
- **O2 — what a master admin is in the app:** a mark on an account ("Master admin"), set only by another master admin,
  opening "+ New squadron" on Admin → Squadrons; the demo's admin sign-in (Saber) is one, and a second 142 admin and a
  149 admin are seeded so a plain admin's view can be seen.
- **O3 — whose people an admin sees on Admin → Users:** his own squadron's people only; a man of the other squadron is
  given View of this squadron from here by search (the row shows his squadron), the rest of his row read only.
- **O4 — what a View-only person sees of the other squadron:** its schedule pages as View-only Sched shows them to a
  member, and its Logic read only; the other squadron's bell does not reach him (he is told only of his own squadron's
  things) — until borrowing, when a pick of him rings his own bell (batch 3).
- **O5 — the "149 ▾" on a phone:** the same button in the same place, the menu opening as a sheet from the top.
- **O6 — undrawn pieces drawn for the first time on the page (D1625):** the home-squadron field on New person; each
  squadron's own Off day under a shared holiday list; "+ New squadron" for a master admin; the Schedules menu with no
  detachment in it.
- **O7 — his browser's demo changes:** the store starts fresh once, both squadrons seeded (D22).

### 3.4 Architecture (the technical how — the agent's, red-teamed here)

**Two kinds of record.** (a) *Community records* — a person, his account, his inputs, notices, the units and places —
are one list for the whole app, each carrying its unit where it has one (the column IT asked for). (b) *Schedule-world
records* — weeks and days, published versions and amendments, saved plans, the planning calendar, Logic (`rules`), the
day and wave templates, the flying plan, each unit's switches — belong to one unit and are stored under it.

- **New tables:** `Unit` (`id` opaque, `num` "142", `kind` squadron — detachment from batch 2, `parent`, `places`: a
  history `[{ place, from }]`, `off` its Off day) and `Place` (`id`, `name`, `tz` an IANA zone name such as
  `Australia/Perth`; GMT+X worked out for the date shown, never stored). Each through `commit()`, a `COMMAND_OPS` row,
  a `PERMS` row and §11 together, a row mapper in `persist.ts wireRows`, a `tableOf` case — the undo-contract §5
  checklist whole.
- **A person's home is a history, not a field:** `homes: [{ unit, from }]` — one entry until batch 4's transfer adds
  one; "whose man is he on date D" is one function (`homeOn(pid, iso)`), used everywhere, so batch 4 adds a row and
  changes no reader.
- **Accounts gain rights per unit:** `{ unit, level: 'admin' | 'member' | 'view' }[]` plus `master: boolean`; the home
  unit's level is today's admin/member; `view` only for another unit. `perms.ts` asks "may this person do this **in
  this unit**?" — every check gains the unit; the permissions test pairs the new columns with §11 (D200). A security
  read (D1411).
- **The schedule world is swapped, not filtered.** The scheduler's module singletons (`DAYS`, `SCHED`, `DATES`,
  `CURWEEK`, `PLANPUCKS`, `DAYRMK`, `VCONF`/`SHIFT_HARD`, the `*_CFG` templates) hold the ONE unit in view, exactly as
  they hold one week today; the "149 ▾" pick reloads them from that unit's rows by the path `loadWeek` already uses
  (reset in place, hydrate, validate, notify). Week and setting keys gain the unit (`weeks/<unit>~<wk>`,
  `settings/<unit>~rules`), so 142's and 149's weeks of the same dates never collide. **Undo** keeps one list per unit
  for the session; a switch shows that unit's own list (D148: his own changes only).
- **Community singletons are filtered, never swapped:** `PEOPLE` and `INPUTS` hold both squadrons (borrowing in batch 3
  and the transfer in batch 4 need them whole). Every reader of `PEOPLE` (81 files) is classified once —
  *a roster of a unit* (crew lists, the ALL AVAIL crowd, count rows, Quals, Admin → Users, pickers, Insights, the Leave
  War and Tracker projections) reads `rosterOf(unit, iso)`; *a look-up by id* stays as it is. A test lists every file
  importing `PEOPLE` and fails on one not in either list, so a new reader cannot leak the other squadron's people.
- **The Leave War** keeps its own store and seams (`.claude/rules/seams/leave-war.md`): its world is the signed-in
  person's home unit, its keys under that unit, its roster projection `rosterOf(home)`. **Public holidays** move from
  each war's days to a list per place, each war reading its place's list, its Off day its own unit's — the OIL earning
  day (`HOOKS.oilEarningDay`, `sync.ts isNonWorkingISO`) reads it through one function. This is the batch's OIL risk:
  the OIL tests run whole, and the walk covers a holiday added by each squadron's admin.
- **The Tracker:** a course carries its unit; the course list and the people bridge show the signed-in person's home
  unit only (D2167).
- **What shows "142" today** — the TALON mark, the print's title and heading, the schedule CSV's and the LoX export's
  file names — reads the unit in view (the schedule's) or the home unit (Quals' LoX).
- **The store:** one schema stamp bump clears the browser store and seeds both units (D22); `hooks.ts store.keys`'s
  fixed `slice(7)` and `adapters.ts`'s prefix are left alone (the unit lives inside the key's id, not in that prefix).
- **The demo:** 149 gets its own people (fewer than 142's, its own callsigns, unique within the community — D288), its
  own demo week on the same dates, its own Leave War world and one Tracker course; seeded accounts for a 149 admin and
  a 149 member (the two seeded sign-ins stay as today, D166).

### 3.5 Risk and check

FULL (permissions; saved data; OIL through the holiday list). The roll-call is wide: every page that lists people, and
every place showing "142". The walk: each of the four seeded sign-ins, each squadron, desktop and phone (his iPhone —
the "149 ▾" sheet); the drawing check against round 2's Admin → Squadrons and Request access, round 3's Schedules
menu, round 4's board number, round 7's R7D1 and R7D5a (as redrawn by chat 104's F3) and R7D6.

### 3.6 Steps inside the batch (one branch, committed in order)

1. Units, places, the person's home history, accounts' rights per unit, the permissions — no screen change; the whole
   unit test set green.
2. The schedule world under its unit; the swap; per-unit undo; the "149 ▾" and Schedules menu; the board's number;
   print and export names.
3. Every `PEOPLE` reader classified, `rosterOf`, the guard test.
4. Admin → Squadrons; Admin → Users' home squadron, View rights, admin of a unit; Request access asking the squadron.
5. The Leave War and the Tracker per unit; the shared holiday list with each Off day; R32's warning.
6. The second demo squadron and the store's fresh start.

## 4. Batch 2 — detachments

Create a detachment (a squadron's own admins — D2093), its short name with the faded "249" (D2116), place and dates
(round 4's fields — no editor existed); the DET input and "+ Put people on it" with the several-people picker, one DET
input for all (D2101, D2120, D2131, D2146, R18); a man's own DET filed and lengthened, never shortened over a planned
day (D2184 Q20); a DET onto the other squadron's open detachment, filed by him or his own schedulers (Q24); its own
schedule, with the time zone in crew rest between places and Close keeping a day already begun there (D2165); one man,
one place — refused when planned, warned after (D2092, D2160); the Leave War's CSE · OD · DET and Days taken's DET
column (Q14, Q19); a DET man on Available but off SC DAY / SC NIGHT, and SC, AVALON, BB not plannable for him (D2168,
D2182); a SANS man's "Available for all these days" (D2169, D2182); sign-off boxes from his own squadron's qualified
people, those there first (Q13); Insights' "249" (Q16 — the cross-schedule weekly hours wait for batch 5); a DET man
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
D2137, D2138 — useful on its own; may go first). Open for its page: a hand Attach naming an app squadron; Fable's L9
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

Insights' one weekly-hours figure across every schedule (Q16 second half); R33 (one OIL credit kept on his own
squadron's record); the notifications register swept for every line the batches added; the table list for the IT side
finished (R35 whole), `data-model.md` §11's intro and §Squadrons' first paragraph corrected (the design note's
"stale records"); the whole-app check (D490) across both squadrons, a detachment and a transfer together.

## 8. What stays out

Caps and ops limits (paused, D2186); the database itself (D473); the aircraft-type split (`[AIRCRAFT-TYPE-SETTING]`,
settled when a second type joins); the purple names (D2100); two squadrons' ALL AVAIL at one time (D2097, no flag).
